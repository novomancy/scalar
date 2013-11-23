/**
 * Scalar    
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0 
 * (the "License"); you may not use this file except in compliance 
 * with the License. You may obtain a copy of the License at
 * 
 * http://www.osedu.org/licenses /ECL-2.0 
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.       
 */  

;(function( $, window, document, undefined ) {

	var pluginName = "scalarheader",
		defaults = {
			root_url: ''
		};
	
	/**
	 * Creates and manages the header bar at the top of the book.
	 */
	function ScalarHeader( element, options ) {
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}
	
	ScalarHeader.prototype.index = null;				// Scalar index plugin
	ScalarHeader.prototype.help = null;					// Scalar help plugin
	ScalarHeader.prototype.search = null;				// Scalar search plugin
	ScalarHeader.prototype.state = null;				// Scalar search plugin
	ScalarHeader.prototype.visualizations = null;		// Scalar visualizations plugin
	
	/**
	 * DOM setup for the header.
	 */
	ScalarHeader.prototype.init = function () {
	
		var me = this;
		
		this.state = 'maximized';
	
		this.lastScroll = $(document).scrollTop();
		
		me.element.attr('id', 'header');
		//me.element.data('state', 'maximized');
		
		$( 'body' ).bind( 'setState', me.handleSetState );
		
		var bookId = parseInt($('#book-id').text());
		$('header').hide();
		
		if (!isMobile) {
			$(window).scroll(function() {
				var currentScroll = $(document).scrollTop();
				
				// if we're scrolling down in Reading mode, then slide the header upwards
				if ((currentScroll > me.lastScroll) && (currentScroll > 50) && (state == ViewState.Reading)) {
					if ( me.state == 'maximized' ) {
						me.state = 'minimized';
						me.element.addClass( 'header_slide' );
					}
					
				// if we're scrolling down, slide the header downwards
				} else if ((me.lastScroll - currentScroll) > 10) {
					if ( me.state == 'minimized' ) {
						me.state = 'maximized';
						me.element.removeClass( 'header_slide' );
					}
				}
				
				me.lastScroll = currentScroll;
			});
		}
		
		this.element.mouseenter(function() {
			if ( me.state == 'minimized' ) {
				me.state = 'maximized';
				me.element.removeClass( 'header_slide' );
			}
		});
		
		var img_url_1 = this.options.root_url+'/images/home_icon.png';
		//this.element.prepend('<div id="home_menu_link"><img src="'+img_url_1+'" alt="Home" width="30" height="30" /></div> ');
		//$('#book-title').parent().wrap('<span id="breadcrumb"></span>');
		//var buttons = $('<div class="right"></div>').appendTo(this.element);
		
		this.element.contents().wrap( '<ul></ul>' );
		
		var list = this.element.find( 'ul' );
		list.prepend('<li id="home_menu_link" class="menu_link"><div><img src="'+img_url_1+'" alt="Home" width="30" height="30" /></div></li> ');
		$('#book-title').parent().wrap('<li id="book_title"><div><span></span></div></li>');
		var buttons = $('<li id="options"><div></div></li>').appendTo(list);
		buttons = buttons.find( 'div' );
		
		
		//$('#book-title').parent().wrap('<span class="breadcrumb"></span>');
		//element.find('.breadcrumb').append('<span class="leaves"> &nbsp;&gt;&nbsp; <a href="#">Filmic Texts</a> &nbsp;&gt;&nbsp; The Limits of Television</span>');
		
		addTemplateLinks($('#breadcrumb'), 'cantaloupe');
		
		
		// various feature buttons
		var searchControl = $('<div class="search_control"></div>').appendTo(buttons);
		addIconBtn(searchControl, 'search_icon.png', 'search_icon_hover.png', 'Search');
		searchControl.append('<form><input class="search_input caption_font" placeholder="Search this book…" type="search" value="" name="search" id="search"/><input class="search_submit" type="submit" value=""></form>');
		$('.search_input').keydown(function(e) {
			if (e.keyCode == 13) {
				me.search.data('plugin_scalarsearch').doSearch(this.value);
				e.preventDefault();
				return false;
			}
		});
		var searchElement = $('<div></div>').appendTo('body');
		this.search = searchElement.scalarsearch( { root_url: modules_uri+'/cantaloupe'} );
		searchControl.find('img').click(function() {
			if (parseInt($('.search_input').width()) == 0) {
				$('.search_input').stop().delay( 100 ).animate({'width': '150%', 'borderColor': '#ddd'}, 250).focus();
				if ( $( '#options' ).hasClass( 'wide' ) ) {
					$( '#options' ).stop().animate( { 'width': ( 368 + 220 ) }, 250 ); // TODO: magic number
				} else {
					$( '#options' ).stop().animate( { 'width': ( 175 + 220 ) }, 250 ); // TODO: magic number
				}
			} else {
				$('.search_input').stop().animate({'width': '0', 'borderColor': '#fff'}, 250).blur();
				$( '#options' ).stop().animate( { 'width': 'auto' }, 250 );
			}
		});
		
		
		addIconBtn(buttons, 'visualization_icon.png', 'visualization_icon_hover.png', 'Visualization');
		//addIconBtn(buttons, 'api_icon.png', 'api_icon_hover.png', 'Data');
		addIconBtn(buttons, 'help_icon.png', 'help_icon_hover.png', 'Help');
		$('[title="Visualization"]').click(function() {
			if (state != ViewState.Navigating) {
				setState(ViewState.Navigating);
			} else {
				setState(ViewState.Reading);
			}
		}).attr( 'id', 'visualization_btn' );
		
		var helpElement = $('<div></div>').appendTo('body');
		this.help = helpElement.scalarhelp( { root_url: modules_uri+'/cantaloupe'} );
		$('[title="Help"]').click(function() {
			me.help.data('plugin_scalarhelp').toggleHelp();
		});
		
		// editing buttons
		if ((scalarapi.model.user_level == "scalar:Author") || (scalarapi.model.user_level == "scalar:Commentator") || (scalarapi.model.user_level == "scalar:Reviewer")) {
			$( '#options' ).addClass( 'wide' );
			buttons.append('<img class="vrule" src="'+this.options.root_url+'/images/'+'gray1x1.gif"/>');
			addIconBtn(buttons, 'new_icon.png', 'new_icon_hover.png', 'New', scalarapi.model.urlPrefix+'new.edit');
			
			//addIconBtn(buttons, 'edit_icon.png', 'edit_icon_hover.png', 'Edit', scalarapi.basepath(window.location.href)+'.edit?'+template_getvar+'=honeydew');
			addIconBtn(buttons, 'edit_icon.png', 'edit_icon_hover.png', 'Edit',  scalarapi.model.urlPrefix+scalarapi.basepath(window.location.href)+'.edit');
			
			buttons.append( '<div id="import_menu_link" class="menu_link"><img src="' + modules_uri + '/cantaloupe/images/' + 'import_icon.png" alt="Import" width="30" height="30"></div>' );
			this.buildImportMenu();
			
			if (currentNode.hasScalarType('media')) {
				addIconBtn(buttons, 'annotate_icon.png', 'annotate_icon_hover.png', 'Annotate', scalarapi.model.urlPrefix+scalarapi.basepath(window.location.href)+'.annotation_editor?'+template_getvar+'=honeydew');
			}
			//addIconBtn(buttons, 'delete_icon.png', 'delete_icon_hover.png', 'Delete');
			addIconBtn(buttons, 'options_icon.png', 'options_icon_hover.png', 'Options', system_uri+'/dashboard?book_id='+bookId+'&zone=style#tabs-style');
		}
		addIconBtn(buttons, 'user_icon.gif', 'user_icon_hover.gif', 'User');
		//$('[title="Delete"]').click(this.handleDelete);
		$('[title="User"]').click(function() {
			document.location = addTemplateToURL(system_uri+'/login?redirect_url='+encodeURIComponent(currentNode.url), 'cantaloupe');
		});

		// load info about the book, build main menu when done
		scalarapi.loadBook(true, function() {
			
			var i, n,
				owners = scalarapi.model.bookNode.properties[ 'http://rdfs.org/sioc/ns#has_owner' ],
				authors = [];
			if ( owners ) {
				n = owners.length;
				for ( i = 0; i < n; i++ ) {
					authors.push( scalarapi.getNode( scalarapi.stripAllExtensions( owners[ i ].value )));
				}
			}
			
			var author,
				n = authors.length,
				bookTitle = $( '#book_title > div > span' );
			for ( var i = 0; i < n; i++ ) {
				author = authors[ i ];
				if ( i == 0 ) {
					bookTitle.append( ' by ' );
				} else if ( i == ( n - 1 )) {
					if ( n > 2 ) {
						bookTitle.append( ', and ' );
					} else {
						bookTitle.append( ' and ' );
					}
				} else {
					bookTitle.append( ', ' );
				}
				bookTitle.append( author.getDisplayTitle() );
			}
			
			me.buildMainMenu();
		});
		
	}
	
	ScalarHeader.prototype.handleSetState = function( event, data ) {
	
		if ( !isMobile ) {
			switch (data.state) {
			
				case ViewState.Reading:
				if ( $(document).scrollTop() != 0 ) {
					header.data('plugin_scalarheader').state = 'minimized';
					$( '#header' ).addClass( 'header_slide' );
				}
				break;
			
				case ViewState.Navigating:
				header.data('plugin_scalarheader').state = 'maximized';
				$( '#header' ).removeClass( 'header_slide' );
				break;
			
				case ViewState.Modal:
				header.data('plugin_scalarheader').state = 'maximized';
				$( '#header' ).removeClass( 'header_slide' );
				break;
			
			}
		}
	
	}
	
	/**
	 * Confirms that the user wants to trash an item, and does so if needed.
	 */
	ScalarHeader.prototype.handleDelete = function() {
	
		var result = confirm('Are you sure you wish to hide this page from view (move it to the trash)?');
		
		if (result) {
		
			// assemble params for the trash action
			var node = scalarapi.model.currentPageNode,
				baseProperties =  {
					'native': 1,
					id: $('link#parent').attr('href')
				},
				pageData = {
					action: 'UPDATE',
					'scalar:urn': node.current.urn,
					uriSegment: scalarapi.basepath(node.url),
					'dcterms:title': node.current.title,
					'dcterms:description': node.current.description,
					'sioc:content': node.current.content,
					'rdf:type': node.baseType,
					'scalar:metadata:is_live': 0
				},
				relationData = {};
			
			// execute the trash action (i.e. make is_live=0)
			scalarapi.modifyPageAndRelations(baseProperties, pageData, relationData, function(result) {
				if (result) {
					window.location.reload();
				} else {
					alert('An error occurred while moving this content to the trash. Please try again.');
				}
			});
		}
	
	}
			
	/**
	 * Constructs the main menu in the DOM.
	 */
	ScalarHeader.prototype.buildMainMenu = function() {
	
		var node = scalarapi.model.getMainMenuNode(),
			me = this;
		
		if (node != null) {
	
			// gather the main menu items
			var i,
				menu = $('<div id="main_menu" class="menu heading_font"><ol></ol></div>').appendTo('#home_menu_link');
			var menuList = menu.find('ol'),
				menuItems = node.getRelatedNodes('referee', 'outgoing', true);
			var n = menuItems.length;
			
			listItem = $('<p class="unordered">'+$('#book-title').text()+'</p>').appendTo(menuList);
			listItem.data('url', $('#book-title').parent().attr("href"));
			listItem.click(function() {
				window.location = addTemplateToURL($(this).data('url'), 'cantaloupe');
			});
			
			// add them
			if (n > 0) {
				var tocNode, listItem;
				for (i=0; i<n; i++) {
					tocNode = menuItems[i];
					listItem = $('<li>'+tocNode.getDisplayTitle()+'</li>').appendTo(menuList);
					listItem.data('url', tocNode.url);
					listItem.click(function() {
						window.location = addTemplateToURL($(this).data('url'), 'cantaloupe');
					});
				}
			}
			
			/*listItem = $('<p class="unordered">Visualizations</p>').appendTo(menuList);
			var visElement = $('<div></div>').appendTo('body');
			this.visualizations = visElement.scalarvisualizations( {} );
			listItem.click( function() { me.visualizations.data('plugin_scalarvisualizations').showVisualizations(); } );*/
			
			listItem = $('<p class="unordered">Index</p>').appendTo(menuList);
			var indexElement = $('<div></div>').appendTo('body');
			this.index = indexElement.scalarindex( {} );
			listItem.click( function() { me.index.data('plugin_scalarindex').showIndex(); } );
		}
		
		// wait a bit before setting up rollovers to avoid accidental triggering of the menu
		setTimeout(function() {
		
			/*$('#home_menu_link').mouseenter(function(e) {
				if ( state != ViewState.Modal ) {
					$(this).css('backgroundColor', '#eee');
					$('#main_menu').show();
				}
			});*/
				
			$('#home_menu_link').hover( function() {
				if ( state != ViewState.Modal ) {
					$(this).css('backgroundColor', '#eee');
					$( '#main_menu' ).css( 'visibility', 'visible' );
				}
			}, function() {
				$( '#main_menu' ).css( 'visibility', 'hidden' );
				$(this).css('backgroundColor', 'inherit');
			} );
		
			$('#home_menu_link').click(function(e) {
				if ($('#main_menu').css('visibility') == "visible") {
					$(this).css('backgroundColor', '#fff');
					$('#main_menu').css( 'visibility', 'hidden' );
				} else {
					if ( state != ViewState.Modal ) {
						$(this).css('backgroundColor', '#eee');
						console.log('show2');
						$('#main_menu').css( 'visibility', 'visible' );
					}
				}
				e.stopImmediatePropagation();
			});
			
			/*$('#main_menu').mouseleave(function() {
				$('#home_menu_link').css('backgroundColor', 'inherit');
				$('#main_menu').hide();
			})*/
			
			$('body').click(function() {
				$('#home_menu_link').css('backgroundColor', 'inherit');
				$('.menu').css( 'visibility', 'hidden' );
			});
		
		}, 1000);
		
	}
	
	ScalarHeader.prototype.buildImportMenu = function() {
	
		// gather the main menu items
		var listItem, secondaryMenu, secondaryMenuList, secondaryListItem,
			menuLink = $( '#import_menu_link' ),
			menu = $('<div id="import_menu" class="menu heading_font"><ul></ul></div>').appendTo( menuLink );
			menuList = menu.find('ul');
			
		var handleListItemHover = function() {
			if ( state != ViewState.Modal ) {
				var i, n, menuData, menuDatum, submenu, secondaryListItem;
				
				$( '.submenu' ).css( 'visibility', 'hidden' );
				submenu = $( this ).data( 'submenu' );
				if ( submenu == null ) {
					var secondaryMenu = $( '<div class="menu heading_font submenu"><ul></ul></div>' ).appendTo( $( '#import_menu_link ') ),
						secondaryMenuList = secondaryMenu.find( 'ul' );
					menuData = $( this ).data( 'submenuData' );
					n = menuData.length;
					for ( i = 0; i < n; i++ ) {
						menuDatum = menuData[ i ];
						secondaryListItem = $( '<li>' + menuDatum.title + '</li> ').appendTo( secondaryMenuList );
						secondaryListItem.data( 'url', menuDatum.url );
						secondaryListItem.click( function() {
							$( '.submenu' ).css( 'visibility', 'hidden' );
							window.location = $( this ).data( 'url' );
						} );
					}
					$( this ).data( 'submenu', secondaryMenu );
					secondaryMenu.css( {
						'visibility': 'visible',
						'top': $( this ).offset().top,
						'left': $( this ).offset().left - secondaryMenu.width()
					} );
				} else {
					submenu.css( 'visibility', 'visible' );
				}
			}
		} 
		
		listItem = $( '<li>Affiliated archives</li>' ).appendTo( menuList );
		listItem.data( 'submenuData', [
			{ title: 'Critical Commons', url: scalarapi.model.urlPrefix + 'import/critical_commons' },
			{ title: 'Cuban Theater Digital Archive', url: scalarapi.model.urlPrefix + 'import/cuban_theater_digital_archive' },
			{ title: 'Hemispheric Institute Digital Video Library', url: scalarapi.model.urlPrefix + 'import/hemispheric_institute' },
			{ title: 'Hypercities', url: scalarapi.model.urlPrefix + 'import/hypercities' },
			{ title: 'Internet Archive', url: scalarapi.model.urlPrefix + 'import/internet_archive' },
			{ title: 'Hypercities', url: scalarapi.model.urlPrefix + 'import/hypercities' },
			{ title: 'Play!', url: scalarapi.model.urlPrefix + 'import/play' },
			{ title: 'Shoah Foundation VHA Online', url: scalarapi.model.urlPrefix + 'import/shoah_foundation_vha_online' },
			{ title: 'Shoah Foundation VHA (partner site)', url: scalarapi.model.urlPrefix + 'import/shoah_foundation_vha' }
		] );
		listItem.hover( handleListItemHover );
		
		listItem = $( '<li>Other archives</li>' ).appendTo( menuList );
		listItem.data( 'submenuData', [
			{ title: 'Prezi', url: scalarapi.model.urlPrefix + 'import/prezi' },
			{ title: 'SoundCloud', url: scalarapi.model.urlPrefix + 'import/soundcloud' },
			{ title: 'Vimeo', url: scalarapi.model.urlPrefix + 'import/vimeo' },
			{ title: 'YouTube', url: scalarapi.model.urlPrefix + 'import/youtube' }
		] );
		listItem.hover( handleListItemHover );
		
		listItem = $( '<li>Local media files</li>' ).appendTo( menuList );
		listItem.click( function() {
			$( '.submenu' ).css( 'visibility', 'hidden' );
			window.location = scalarapi.model.urlPrefix + 'upload';
		} );
		listItem.hover( function() { $( '.submenu' ).css( 'visibility', 'hidden' ); } )
		
		listItem = $( '<li>Internet media files</li>' ).appendTo( menuList );
		listItem.click( function() {
			$( '.submenu' ).css( 'visibility', 'hidden' );
			window.location = scalarapi.model.urlPrefix + 'new.edit#type=media';
		} );
		listItem.hover( function() { $( '.submenu' ).css( 'visibility', 'hidden' ); } )
		
		listItem = $( '<li>Other Scalar books</li>' ).appendTo( menuList );
		listItem.click( function() {
			$( '.submenu' ).css( 'visibility', 'hidden' );
			window.location = scalarapi.model.urlPrefix + 'import/system';
		} );
		listItem.hover( function() { $( '.submenu' ).css( 'visibility', 'hidden' ); } )
		
		menuLink.hover( function() {
			if ( state != ViewState.Modal ) {
				$(this).css('backgroundColor', '#eee');
				$( '#import_menu' ).css( {
					'visibility': 'visible',
					'left': $( this ).offset().left - $( '#import_menu' ).width() + menuLink.width() + ( parseInt( menuLink.css( 'padding-left' ) ) * 2 )
				} );
			}
		}, function() {
			$( '#import_menu' ).css( 'visibility', 'hidden' );
			$( '.submenu' ).css( 'visibility', 'hidden' );
			$(this).css('backgroundColor', 'inherit');
		} );
	
		menuLink.click(function(e) {
			if ($('#import_menu').css('visibility') == "visible") {
				$(this).css('backgroundColor', '#fff');
				$('#import_menu').css( 'visibility', 'hidden' );
			} else {
				if ( state != ViewState.Modal ) {
					$(this).css('backgroundColor', '#eee');
					console.log('show2');
					$('#import_menu').css( 'visibility', 'visible' );
				}
			}
			e.stopImmediatePropagation();
		});

	}
	
	/*ScalarHeader.prototype.buildAdminMenu = function() {
	
		// gather the main menu items
		var menu = $('<div class="menu"><ul></ul></div>').appendTo(this.element);
		var menuList = menu.find('ul');
		
		listItem = $('<ul>Dashboard</ul>').appendTo(menuList);
		listItem = $('<ul>Import</ul>').appendTo(menuList);
		
		// add them
		if (n > 0) {
			var tocNode, listItem;
			for (i=0; i<n; i++) {
				tocNode = menuItems[i];
				listItem = $('<li>'+tocNode.getDisplayTitle()+'</li>').appendTo(menuList);
				listItem.data('url', tocNode.url);
				listItem.click(function() {
					window.location = addTemplateToURL($(this).data('url'), 'cantaloupe');
				});
			}
		}
		
		listItem = $('<p class="unordered">Index</p>').appendTo(menuList);
		
		// wait a bit before setting up rollovers to avoid accidental triggering of the menu
		setTimeout(function() {
		
			$('#home_menu_link').mouseenter(function(e) {
				$(this).css('backgroundColor', '#eee');
				$('#main_menu').show();
			});
		
			$('#home_menu_link').click(function(e) {
				if ($('#main_menu').css('display') == "block") {
					$(this).css('backgroundColor', '#fff');
					$('#main_menu').hide();
				} else {
					$(this).css('backgroundColor', '#eee');
					$('#main_menu').show();
				}
				e.stopImmediatePropagation();
			});
			
			$('#main_menu').mouseleave(function() {
				$('#home_menu_link').css('backgroundColor', 'inherit');
				$('#main_menu').hide();
			})
			
			$('body').click(function() {
				$('#home_menu_link').css('backgroundColor', 'inherit');
				$('#main_menu').hide();
			});
		
		}, 1000);
	
	}*/
			
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName,
                new ScalarHeader( this, options ));
            }
        });
    }

})( jQuery, window, document );
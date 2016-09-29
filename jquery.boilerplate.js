// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.


;( function( $, window, document, undefined ) {

  "use strict";


    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variables rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    var pluginName = "defaultPluginName",
      defaults = {
        autoPlay:false,
        onComplete: null,
        carouselWidth: 748
      };

    var intervalID;
    var slideCount = 0;
    var slideIndex = 0;


    // The actual plugin constructor
    function Plugin ( element, options ) {
      this.element = element;

      // jQuery has an extend method which merges the contents of two or
      // more objects, storing the result in the first object. The first object
      // is generally empty as we don't want to alter the default options for
      // future instances of the plugin
      this._defaults = defaults;
      this._name = pluginName;
      this.settings = $.extend( {}, defaults, options );

      this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
      init: function() {
        this.initSlides();
        this.bindEvent();
      },

      initSlides: function () {
        var ul = $(this.element).find('ul');
        slideCount = ul.children().length;
        var slideWithPercent = 100.0 / slideCount;

        var firstSlide = ul.find("li:first-child");
        var lastSlide = ul.find("li:last-child");
        // Clone the last slide and add as first li element
        lastSlide.clone().prependTo(ul);

        // Clone the first slide and add as last li element
        firstSlide.clone().appendTo(ul);

        ul.find("li").each(function(indx) {
          var leftPercent = (slideWithPercent * indx) + "%";
          $(this).css({"left":leftPercent});
          $(this).css({width:(100 / slideCount) + "%"});
        });
        ul.css("margin-left", "-100%");
      },

      bindEvent : function() {
        var plugin = this;
        var namespace = '.'+plugin._name;
        $(this.element).find('.carousel-control-prev').on('click'+namespace, function() {
          clearInterval(intervalID);
          plugin.updateCarousel(slideIndex - 1);

        })
        $(this.element).find('.carousel-control-next').on('click'+namespace, function() {
          clearInterval(intervalID);
          plugin.updateCarousel(slideIndex + 1);
        })
        $(this.element).find('.carousel-pagination  a').each (function() {
          clearInterval(intervalID);
          $(this).on ('click'+namespace, function() {
            var nextSelector = parseInt( $(this).html(), 10);
            plugin.updateCarousel(nextSelector - 1);
          });
        });
        if(this.settings.autoPlay === true) {
          intervalID = setInterval(function () {
            plugin.updateCarousel(slideIndex + 1);
          }, 10000);
        }
      },

      unbindEvent: function() {
        var namespace = '.'+this._name;
        $(this.element).find('*').off(namespace);
        clearInterval(intervalID);
      },

      destroy: function() {
            /*
                The destroy method unbinds all events for the specific instance
                of the plugin, then removes all plugin data that was stored in
                the plugin instance using jQuery's .removeData method.

                Since we store data for each instance of the plugin in its
                instantiating element using the $.data method (as explained
                in the plugin wrapper below), we can call methods directly on
                the instance outside of the plugin initalization, ie:
                $('selector').data('plugin_myPluginName').someOtherFunction();

                Consequently, the destroy method can be called using:
                $('selector').data('plugin_myPluginName').destroy();
            */
            this.unbindEvents();
            this.$element.removeData();
      },

      initCarouselPaginationClickEvent: function() {
        var nextSelector = parseInt( $(this).html(), 10);
        this.updateCarousel(nextSelector);
      },

      updateCarousel: function(newSlideIndex) {

        var marginLeftPercent = (newSlideIndex * (-100) - 100) + "%";
        $('.carousel').find('ul').animate({
          opacity: 0.50,
          "margin-left": marginLeftPercent
        }, 1000, function() {
          // Animation complete.
          $(this).css('opacity', 1);
          // If new slide is before first slide...
          if(newSlideIndex < 0) {
            $(this).css("margin-left", ((slideCount) * (-100)) + "%");
            newSlideIndex = slideCount - 1;
          }
          // If new slide is after last slide...
          else if(newSlideIndex >= slideCount) {
            $(this).css("margin-left", "-100%");
            newSlideIndex = 0;
          }
          slideIndex = newSlideIndex;
          $('.carousel').find('.carousel-pagination a.active').removeClass('active');
          $('.carousel').find('.carousel-pagination a:nth-child(' + (slideIndex + 1)  + ')').addClass('active');

        });

        this.callback();
      },

      callback: function() {
            // Cache onComplete option
            var onComplete = this.settings.onComplete;

            if ( typeof onComplete === 'function' ) {
                onComplete.call(this.element);
            }
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function( options ) {
      return this.each( function() {
        if ( !$.data( this, "plugin_" + pluginName ) ) {
          $.data( this, "plugin_" +
            pluginName, new Plugin( this, options ) );
        }
      } );
    };
} )( jQuery, window, document );

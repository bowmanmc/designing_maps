
$(document).ready(function() {

    console.log('Setting up slide controller...');

    var currentIdx = 0; // keep track of for keypress events

    var slides = [];
    $('.slide').each(function(idx) {
        var id = this.id;
        slides.push(id);
    });

    var scrollTo = function(idx) {
        if (idx < 0) {
            // Scroll to the last slide
            idx = slides.length - 1;
        }
        if (idx > slides.length - 1) {
            // Scroll to the first slide
            idx = 0;
        }
        currentIdx = idx;
        var id = slides[idx];
        var el = $('#' + id);
        // This is hacky, but works because of the specific div structure
        // I'm using with bootstrap. Adds the padding on the body element
        // for the navbar
        var px = el.offset().top - el.parent().offset().top;
        console.log('Scrolling to ' + id + '[' + idx + '] at ' + px);
        $('html, body').animate({
            scrollTop: px
        }, 350);
    };

    // When a slide is clicked, move to the next one
    $('.slide').on('click', function() {
        scrollTo(currentIdx + 1);
    });

    // Hookup keyboard navigation
    $(document).keydown(function(e) {
        var backKeys = [
            37, // left arrow
            38, // up arrow
            8   // delete key
        ];

        var forwardKeys = [
            39, // right arrow
            40, // down arrow
            13, // enter key
            32  // spacebar
        ];

        if (backKeys.indexOf(e.which) >= 0) {
            scrollTo(currentIdx - 1);
            e.preventDefault();
        }
        else if (forwardKeys.indexOf(e.which) >= 0) {
            scrollTo(currentIdx + 1);
            e.preventDefault();
        }

    });

}); // ready

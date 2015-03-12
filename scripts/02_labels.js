
function OhioMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;

    this.draw = function() {

        var map = this;

        var el = document.getElementById(map.divId);

        // Ohio Map Dimensions: 960x1200 (width x height)
        // Use this to scale the map up/down depending on
        // size of map container.
        map.height = el.clientHeight;
        map.width = (960 / 1200) * map.height;
        console.log('Making map size: ' + map.width + 'x' + map.height);

        // For more on map projections, see:
        // https://github.com/mbostock/d3/wiki/Geo-Projections
        map.projection = d3.geo.conicConformal();
        map.path = d3.geo.path().projection(map.projection);

        // Select the svg node under fullscreen-map
        map.svg = d3.select(map.divSelector).select('svg')
            .attr({
                'width': map.width,
                'height': map.height
            });

        /**
         *    Look in 02_labels.html for our svg definitions. At this point,
         *    our svg node looks like:
         *      <svg width="960" height="1200">
         *          <defs>
         *              <pattern id="circlefill" x=0 ...>
         *                  <circle cx=3 cy=3 r=3 class="circle" />
         *              </pattern>
         *              <radialGradient id="circleGradient" ...>
         *                  <stop ... offset="10%" />
         *                  <stop ... offset="100%"
         *              </radialGradient>
         *              <linearGradient id="txtGradient" ...>
         *                  <stop ... offset="5%" />
         *                  <stop ... offset="50%" />
         *                  <stop ... offset="85%" />
         *              </linearGradient>
         *          </defs>
         *      </svg>
         */

        // now load the map data and append the path elements to the svg node
        map.getState().then(function(data) {
            map.drawState(data);
        });
    };

    this.getState = function() {
        var deferred = $.Deferred();
        d3.json('maps/state.oh.json', function(error, response) {
            deferred.resolve(response);
        });
        return deferred.promise();
    };

    this.drawState = function(data) {

        var map = this;

        // Since we picked the conicConformal projection, we need to also
        // rotate the map so our map doesn't look funky.
        var centroid = d3.geo.centroid(data.features[0]);
        var r = [centroid[0] * -1, centroid[1] * -1];
        // Start the projection from defaults (looking at Ohio)
        map.projection.scale(1).translate([0, 0]).rotate(r);

        var b = map.path.bounds(data),
            s = 0.95 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
            t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

        map.projection.scale(s).translate(t);

        // State Outline with our circle fill pattern
        map.svg.selectAll('path')
            .data(data.features)
            .enter().append('path')
            .attr({
                'id': 'pathOhio',
                'class': 'state',
                'fill': 'url(#circlefill)',
                'd': map.path
            });

        // Clip path for the text (not rendered to the screen. See the
        // clip-path attribute on the text label.)
        map.svg.selectAll('clipPath')
            .data(data.features)
            .enter().append('clipPath')
            .attr('id', 'clipohio')
            .append('path')
            .attr('d', map.path);

        // Ohio text label
        map.svg.selectAll('g')
            .data(data.features)
            .enter().append('g')
            .attr('clip-path', 'url(#clipohio)')
            .append('text')
            .text('OHIO')
            .attr({
                'id': 'txtOhio',
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
                'class': 'label',
                'fill': 'url(#txtgradient)'
            })
            .attr('transform', function(d, i) {
                var centroid = d3.geo.centroid(d);
                return 'translate(' + map.projection(centroid) + ')';
            });

        // scale the text
        map.scaleTextToPath('#txtOhio', '#pathOhio');
    };

    this.scaleTextToPath = function(textSelector, pathSelector) {
        var pathNode = d3.select(pathSelector).node();
        var pathBox = pathNode.getBBox();
        var txt = d3.select(textSelector);
        var textNode = txt.node();
        var textBox = textNode.getBBox();
        var widthTransform = pathBox.width / textBox.width;
        var heightTransform = pathBox.height / textBox.height;
        var value = Math.min(widthTransform, heightTransform);

        var transform = txt.attr('transform');
        transform = transform + ' scale(' + (value + 1) + ')';
        txt.attr('transform', transform);
        console.log('Transform: ' + JSON.stringify(txt.attr('transform')));
    };

}; // OhioMap

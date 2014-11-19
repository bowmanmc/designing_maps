
function OhioMap(elementIdSelector) {

    this.mapSelector = elementIdSelector;

    this.drawMap = function() {

        var map = this;

        var el = $(map.mapSelector)[0];
        if (typeof el === 'undefined') {
            console.log('ERROR - No element matching: ' + this.mapSelector);
            return;
        }

        //var width = 960,
        //    height = 1200;
        map.height = el.clientHeight;
        map.width = (960 / 1200) * map.height;
        console.log('Making map size: ' + map.width + 'x' + map.height);

        map.projection = ProjectionFactory.mercator(map.width, map.height);
        //map.projection = ProjectionFactory.conicConformal(map.width, map.height);

        map.path = d3.geo.path().projection(map.projection);

        map.svg = d3.select(map.mapSelector).append('svg')
            .attr('width', map.width)
            .attr('height', map.height);

        this.drawState();
    };

    this.drawState = function() {

        var map = this;
        d3.json('maps/state.oh.json', function(error, response) {

            map.projection.scale(1).translate([0, 0]);

            var b = map.path.bounds(response),
                s = 0.95 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
                t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

            map.projection.scale(s).translate(t);

            map.svg.selectAll('path')
                .data(response.features)
                .enter().append('path')
                .attr('id', 'pathOhio')
                .attr('class', 'state')
                .attr('d', map.path);

            map.svg.selectAll('g')
                .data(response.features)
                .enter().append('g')
                .attr('clip-path', 'url(#clipohio)')
                .append('text')
                .text('OHIO')
                .attr('id', 'txtOhio')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'label')
                .attr('transform', function(d, i) {
                    var centroid = d3.geo.centroid(d);
                    var bounds = d3.geo.bounds(d);
                    console.log('center: ' + JSON.stringify(centroid));
                    console.log('bounds: ' + JSON.stringify(bounds));
                    //return "translate(" + map.projection([bounds[0][0], centroid[1]]) + ")";
                    var proj = map.projection(centroid);
                    var translation = 'translate(' + proj + ')';
                    return translation;// + ' ' + scale;
                });

            map.svg.selectAll('clipPath')
                .data(response.features)
                .enter().append('clipPath')
                .attr('id', function(d, i) {
                    return 'clipohio';
                })
                .append('path')
                .attr('d', map.path);


            // size the text
            var pathNode = d3.select('#pathOhio').node();
            var pBox = pathNode.getBBox();
            var txt = d3.select('#txtOhio');
            var textNode = txt.node();
            var bb = textNode.getBBox();
            var widthTransform = pBox.width / bb.width;
            var heightTransform = pBox.height / bb.height;
            var value = widthTransform < heightTransform ? widthTransform : heightTransform;

            var transform = txt.attr('transform');
            console.log('Transform: ' + JSON.stringify(txt.attr('transform')));
            transform = transform + ' scale(' + (value + 1) + ')';
            txt.attr('transform', transform);
            console.log('Transform: ' + JSON.stringify(txt.attr('transform')));
        });

    };

}; // OhioMap

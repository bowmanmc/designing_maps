
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

        map.defs = map.svg.append('defs');
        map.bg = map.svg.append('g');
        map.fg = map.svg.append('g');

        this.drawState().then(function() {
            map.drawCounties();
        });
    };

    this.drawState = function() {
        var deferred = $.Deferred();

        var map = this;
        d3.json('maps/state.oh.json', function(error, response) {

            console.log('Drawing state');

            map.projection.scale(1).translate([0, 0]);

            var b = map.path.bounds(response),
                s = 0.95 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
                t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];
            map.projection.scale(s).translate(t);

            map.fg.selectAll('path')
                .data(response.features)
                .enter().append('path')
                .attr('class', 'state')
                .attr('d', map.path);

            deferred.resolve();
        });

        return deferred.promise();
    };

    this.drawCounties = function() {
        // use promises since d3.json is async
        var deferred = $.Deferred();

        var map = this;

        d3.json('maps/county.oh.json', function(error, response) {

            console.log('Drawing counties');

            map.defs.selectAll('clipPath')
                .data(response.features)
                .enter().append('clipPath')
                .attr('id', function(d, i) {
                    return 'clip-' + d.properties['FIPS_CODE']
                })
                .append('path')
                .attr('d', map.path);

            map.bg.selectAll('path')
                .data(response.features)
                .enter().append('path')
                .attr('class', function(d, i) {
                    if (d.properties['COUNTY_NAM'] == 'MONTGOMERY') {
                        return 'county home';
                    }
                    return 'county'
                })
                .attr('d', map.path)
                .on('mouseover', function(d) {
                    map.handleHover(d);
                });
            map.fg.selectAll('text')
                .data(response.features)
                .enter().append('text')
                .text(function(d, i) {
                    return d.properties['COUNTY_NAM'];
                })
                .attr('class', 'label')
                .attr('text-anchor', 'middle')
                .attr('transform', function(d, i) {
                    var centroid = d3.geo.centroid(d);
                    var bounds = d3.geo.bounds(d);
                    console.log('center: ' + JSON.stringify(centroid));
                    console.log('bounds: ' + JSON.stringify(bounds));
                    //return "translate(" + map.projection([bounds[0][0], centroid[1]]) + ")";
                    var translation = 'translate(' + map.projection(centroid) + ')';
                    // var scale =  'scale(0.25)';
                    var scale = 'scale(0.5)';
                    return translation + ' ' + scale;
                });

            deferred.resolve();
        });

        return deferred.promise();
    };

    this.handleHover = function(d) {
        $('#name').text(d.properties['COUNTY_NAM'] + ' - ' + d.properties['FIPS_CODE']);
    };

}; // OhioMap

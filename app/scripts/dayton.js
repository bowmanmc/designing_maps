
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

        map.svg = d3.select(map.divSelector).append('svg')
            .attr({
                'width': map.width,
                'height': map.height
            });


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

        map.svg.selectAll('path')
            .data(data.features)
            .enter().append('path')
                .attr({
                    'class': 'state',
                    'd': map.path
                });

        map.svg.selectAll('circle')
            .data([{
                'name': 'dayton',
                'lat': 39.7594,
                'lon': -84.1917
            }, {
                'name': 'cincinnati',
                'lat': 39.1000,
                'lon': -84.5167
            }, {
                'name': 'columbus',
                'lat': 39.9833,
                'lon': -82.9833
            }, {
                'name': 'cleveland',
                'lat': 41.4822,
                'lon': -81.6697
            }])
            .enter().append('circle')
            .attr('r', function(d, i) {
                if (d.name == 'dayton') {
                    return 9;
                }
                return 3;
            })
            .attr('class', function(d, i) {
                if (d.name == 'dayton') {
                    return 'pin home';
                }
                return 'pin';
            })
            .attr('transform', function(d) {
                return "translate(" + map.projection([
                    d.lon,
                    d.lat
                ]) + ")"
            });
    };

}; // OhioMap

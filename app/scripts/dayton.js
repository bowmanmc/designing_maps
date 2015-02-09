
function DaytonMap(elementIdSelector) {

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

        //map.projection = ProjectionFactory.mercator(map.width, map.height);
        map.projection = ProjectionFactory.conicConformal(map.width, map.height);

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
                s = 0.98 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
                t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

            map.projection.scale(s).translate(t);

            map.svg.selectAll('path')
                .data(response.features)
                .enter().append('path')
                .attr('class', 'state')
                .attr('d', map.path);

            map.svg.selectAll('circle')
                .data([{
                    lat: 39.7594,
                    lon: -84.1917
                }])
                .enter().append('circle')
                .attr('r', 10)
                .attr('class', 'pin')
                .attr('transform', function(d) {
                    return "translate(" + map.projection([
                        d.lon,
                        d.lat
                    ]) + ")";
                })
        });

    };

}; // OhioMap

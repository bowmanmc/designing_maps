
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
            .attr('width', map.width)
            .attr('height', map.height);

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
            .attr('class', 'state')
            .attr('d', map.path);
    };

}; // OhioMap

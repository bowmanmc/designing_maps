

function OhioMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;

    this.initMap = function() {

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

        map.bg = map.svg.append('g');
        map.fg = map.svg.append('g');

        map.getState().then(function() {
            map.getCounties().then(function() {
                map.draw();
            });
        });

        $('#draw').click(function() {
            map.clear();
            map.draw();
        });
    }; // initMap


    this.clear = function() {
        this.bg.html('');
        this.fg.html('');
    };

    this.draw = function() {
        this.drawState();
        this.drawCounties();
    };

    this.getState = function() {
        var deferred = $.Deferred();
        var map = this;
        d3.json('maps/state.oh.json', function(error, response) {
            map.state = response;
            deferred.resolve();
        });
        return deferred.promise();
    };
    this.drawState = function() {
        var map = this;

        var centroid = d3.geo.centroid(map.state.features[0]);
        var r = [centroid[0] * -1, centroid[1] * -1];
        // Start the projection from defaults (looking at Ohio)
        map.projection.scale(1).translate([0, 0]).rotate(r);

        var b = map.path.bounds(map.state),
            s = 0.95 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
            t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

        map.projection.scale(s).translate(t);

        var ohioPath = map.fg.selectAll('path')
            .data(map.state.features)
            .enter().append('path')
            .attr('id', 'pathOhio')
            .attr('class', 'state')
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .attr('d', map.path);

        map.animate('#' + ohioPath.attr('id'));
    };

    this.getCounties = function() {
        var deferred = $.Deferred();
        var map = this;
        d3.json('maps/county.oh.json', function(error, response) {
            map.counties = response;
            deferred.resolve();
        });
        return deferred.promise();
    };
    this.drawCounties = function() {
        var map = this;
        map.bg.selectAll('path')
            .data(map.counties.features)
            .enter().append('path')
            .attr('id', function(d) {
                return 'county_' + d.properties['FIPS_CODE'];
            })
            .attr('class', function(d, i) {
                if (d.properties['COUNTY_NAM'] == 'MONTGOMERY') {
                    return 'county home';
                }
                return 'county'
            })
            .attr('stroke', '#999')
            .attr('stroke-width', 1)
            .attr('d', map.path)
            .on('mouseover', function(d) {
                $('#name').text(d.properties['COUNTY_NAM']);
            });

        map.bg.selectAll('path').each(function(d, i) {
            map.animate('#county_' + d.properties['FIPS_CODE']);
        });
    };

    this.animate = function(selector) {
        var speed = 2.5;
        var path = document.querySelector(selector);
        var length = path.getTotalLength();

        // Set up the starting positions
        path.style.strokeDasharray = length + ' ' + length;
        path.style.strokeDashoffset = length;
        // Clear any previous transition
        path.style.transition = path.style.WebkitTransition =
        'none';
        // Set up the starting positions
        path.style.strokeDasharray = length + ' ' + length;
        path.style.strokeDashoffset = length;
        // Trigger a layout so styles are calculated & the browser
        // picks up the starting position before animating
        path.getBoundingClientRect();
        // Define our transition
        path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + speed + 's ease';
        // Go!
        path.style.strokeDashoffset = '0';
    };

}; // OhioMap

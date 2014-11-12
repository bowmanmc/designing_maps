
function SkylineMap(elementIdSelector) {

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

        map.path = d3.geo.path().projection(map.projection);

        map.svg = d3.select(map.mapSelector).append('svg')
            .attr('width', map.width)
            .attr('height', map.height);

        map.bg = map.svg.append('g');
        map.fg = map.svg.append('g');
        map.dt = map.svg.append('g');

        var app = this;
        app.drawState().then(function() {
            app.drawCounties().then(function() {
                app.drawSkylines();
            })
        })
    };

    this.drawSkylines = function() {

        var map = this;
        var pinSizeOut = 3;
        var pinSizeOver = 9;
        d3.tsv('data/skyline.oh.tsv', function(error, response) {
            map.dt.selectAll('circle')
                .data(response)
                .enter().append('circle')
                .attr('r', pinSizeOut)
                .attr('class', 'pin')
                .style('fill', '#ff0909')
                .attr('transform', function(d) {
                    return "translate(" + map.projection([
                        d.longitude,
                        d.latitude
                    ]) + ")";
                })
                .on('click', function(d, i) {
                    map.handleClick(d, i);
                })
                .on('mouseover', function() {
                    d3.select(this)
                        .attr('r', pinSizeOut)
                        .transition()
                        .duration(500)
                        .ease('elastic')
                        .attr('r', pinSizeOver)
                        .style('fill', '#feb24c');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .ease('elastic')
                        .attr('r', pinSizeOut)
                        .style('fill', '#ff0909');
                });
        });
    };

    this.handleClick = function(d, i) {
        console.log('Clicked Item [' + i + ']: ' + JSON.stringify(d));
        $('#name').html(
            '<strong>' + d.store + ' (' + d.name + ')</strong> <br />' +
            d.address + '<br />' + d.phone);
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
            map.bg.selectAll('path')
                .data(response.features)
                .enter().append('path')
                .attr('class', 'county')
                .attr('d', map.path);
            deferred.resolve();
        });

        return deferred.promise();
    };

}; // OhioMap

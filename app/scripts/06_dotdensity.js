
function SkylineMap(elementId) {

    this.divId = elementId;
    this.divSelector = '#' + elementId;

    this.drawMap = function() {

        var map = this;
        var el = document.getElementById(map.divId);

        // For this one, since we're using a satellite projection, just take
        // up the entire div
        map.width = el.clientWidth;
        map.height = el.clientHeight;

        map.projection = d3.geo.satellite()
            .distance(1.05)
            .rotate([84.00, -35.00, 5.00])
            .tilt(5);
        map.path = d3.geo.path().projection(map.projection);

        map.svg = d3.select(map.divSelector).append('svg')
            .attr('width', map.width)
            .attr('height', map.height);

        map.cv = map.svg.append('g');
        map.bg = map.svg.append('g');
        map.fg = map.svg.append('g');
        map.dt = map.svg.append('g');

        map.drawState().then(function() {
            map.drawCounties().then(function() {
                map.drawSkylines();
            });
        });
    };

    this.drawSkylines = function() {

        var map = this;
        var pinSizeOut = 3;
        var pinSizeOver = 12;
        d3.tsv('data/skyline.oh.tsv', function(error, response) {
            map.dt.selectAll('circle')
                .data(response)
                .enter().append('ellipse')
                .attr('rx', pinSizeOut * 1.5)
                .attr('ry', pinSizeOut)
                .attr('class', 'pin')
                .style('fill', '#015018')
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
                        .attr('rx', pinSizeOver * 1.5)
                        .attr('ry', pinSizeOver)
                        .style('fill', '#feb24c');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .ease('elastic')
                        .attr('rx', pinSizeOut * 1.5)
                        .attr('ry', pinSizeOut)
                        .style('fill', '#015018');
                });
        });
    };

    this.handleClick = function(d, i) {
        //console.log('Clicked Item [' + i + ']: ' + JSON.stringify(d));
        $('#sitename').html(d.store + ' - ' + d.name);
        $('#siteaddr').html(d.address.replace(',', '<br />') + '<br />' + d.phone);
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

            var graticule = d3.geo.graticule()
                .extent([[-93, 27], [-47 + 1e-6, 57 + 1e-6]])
                .step([3, 3]);

            map.cv.append('path')
                .datum(graticule)
                .attr('class', 'graticule')
                .attr('d', map.path);

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

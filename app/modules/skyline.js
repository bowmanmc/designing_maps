
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

        var app = this;
        this.drawCounties().then(function() {
            app.drawSkylines().then(function() {
                // app.drawWalmarts();
            });
        });
    };

    // this.drawWalmarts = function() {
    //     var map = this;
    //     var pinSizeOut = 3;
    //     var pinSizeOver = 9;
    //     d3.csv('data/walmart_oh.csv', function(error, response) {
    //         console.log('Got response!');
    //         console.log('Row 1: ' + JSON.stringify(response[0]));
    //         map.fg.selectAll('circle')
    //             .data(response)
    //             .enter().append('circle')
    //             .attr('r', pinSizeOut)
    //             .attr('class', 'pin')
    //             .style('fill', '#006699')
    //             .attr('transform', function(d) {
    //                 return "translate(" + map.projection([
    //                     d.longitude,
    //                     d.latitude
    //                 ]) + ")";
    //             })
    //             .on('click', function(d, i) {
    //                 map.handleClick(d, i);
    //             })
    //             .on('mouseover', function() {
    //                 d3.select(this)
    //                     .attr('r', pinSizeOut)
    //                     .transition()
    //                     .duration(500)
    //                     .ease('elastic')
    //                     .attr('r', pinSizeOver)
    //                     .style('fill', '#00ccff');
    //             })
    //             .on('mouseout', function() {
    //                 d3.select(this)
    //                     .transition()
    //                     .duration(500)
    //                     .ease('elastic')
    //                     .attr('r', pinSizeOut)
    //                     .style('fill', '#006699');
    //             });
    //     });
    // };

    this.drawSkylines = function() {
        // use promises since d3.json is async
        var deferred = $.Deferred();

        var map = this;
        var pinSizeOut = 3;
        var pinSizeOver = 9;
        d3.tsv('data/skyline.oh.tsv', function(error, response) {
            map.fg.selectAll('circle')
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
            deferred.resolve();
        });

        return deferred.promise();
    };

    this.handleClick = function(d, i) {
        console.log('Clicked: ' + JSON.stringify(d));
        $('#name').html('<strong>' + d.name + '</strong> <br />' + d.address);
    };

    this.drawCounties = function() {

        // use promises since d3.json is async
        var deferred = $.Deferred();

        var map = this;

        d3.json('maps/oh-counties.json', function(error, response) {
            var counties = topojson.feature(response, response.objects.counties);

            map.projection.scale(1).translate([0, 0]);

            var b = map.path.bounds(counties),
                s = .95 / Math.max((b[1][0] - b[0][0]) / map.width, (b[1][1] - b[0][1]) / map.height),
                t = [(map.width - s * (b[1][0] + b[0][0])) / 2, (map.height - s * (b[1][1] + b[0][1])) / 2];

            map.projection.scale(s).translate(t);

            map.bg.selectAll('path')
                .data(counties.features.filter(function(d) { return d.id % 1000; }))
                .enter().append('path')
                .attr('class', 'county')
                .attr('d', map.path)
                .append('title')
                .text(function(d) { return d.properties.name; });

            deferred.resolve();
        });

        return deferred.promise();
    };

    this.handleHover = function(d) {
        $('#name').text(d.properties.name);
    };

}; // OhioMap


function DotMap(elementIdSelector) {

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
        map.fg = map.svg.append('g').attr('class', 'Spectral');


        var app = this;
        this.drawCounties().then(function() {
            app.drawDots();
        });
        d3.select('#scaleSelect').on('change', function() {
            app.setScale(this.value);
        });
        d3.select('#rangeSelect').on('change', function() {
            app.setRange(this.value);
        });

        $('#county-info').hide();
    };

    this.drawDots = function() {
        var map = this;
        d3.tsv('data/unemployment.oh.tsv', function(error, response) {
            map.rates = {};
            var extent = d3.extent(response, function(d, i) {
                return d.rate;
            }).reverse();

            var scale = d3.scale.quantize()
                .domain(extent)
                .range(d3.range(9).map(function(i) {
                    return "q" + i + "-" + 9; })
                );

            map.fg.selectAll('circle')
                .data(response)
                .enter().append('circle')
                .attr('r', function(d, i) {
                    var r = (d.rate * 100).toFixed(2);
                    return r;
                })
                .attr("transform", function(d) {
                    var id = '#county_' + d.county_id;
                    var county = d3.select(id).data()[0];
                    var centroid = d3.geo.centroid(county);
                    return "translate(" + map.projection(centroid) + ")";
                })
                .attr('class', function(d, i) {
                    console.log('adding class: ' + scale(d.rate));
                    return 'dot ' + scale(d.rate);
                })
                .on('mouseover', function(d, i) {
                    map.handleHover(d, i);
                });

        });
    };

    this.handleHover = function(d, i) {
        $('#county-info').show();
        var id = '#county_' + d.county_id;
        var county = d3.select(id).data()[0];
        var map = this;
        var rate = (d.rate * 100).toFixed(2);
        d3.select('#name').html(county.properties.name);
        d3.select('#value').html(rate);
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
                .attr('id', function(d) {
                    return 'county_' + d.id
                })
                .attr('class', 'county')
                .attr('d', map.path)
                .append('title')
                .text(function(d) { return d.properties.name; });

            deferred.resolve();
        });

        return deferred.promise();
    };

}; // OhioMap

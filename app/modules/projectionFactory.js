
var ProjectionFactory = ProjectionFactory || {};

ProjectionFactory.conicConformal = function(width, height) {
    return d3.geo.conicConformal()
        //.parallels([40 + 26 / 60, 41 + 42 / 60])
        .rotate([82 + 30 / 60, -39 - 40 / 60])
        .translate([width / 2, height / 2]);
};

ProjectionFactory.albers = function(width, height) {
    return d3.geo.albersUsa()
        .translate([width / 2, height / 2]);
};

ProjectionFactory.mercator = function(width, height) {
    return d3.geo.mercator()
        .translate([width / 2, height / 2]);
};

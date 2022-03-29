class Program {
    constructor(title, properties) {
        this.title = title;
        this.properties = properties;
        this.neighbors = [];
        this.type = '';
    }

    addNeighbor(neighbor) {
        if (this.neighbors.indexOf(neighbor) === -1) {
            this.neighbors.push(neighbor);
        }
    }
}

document.body.onload = function () {
    readFile();
};

async function readFile() {
    Papa.parse('data/output.csv', {
	download: true,
	complete: function(results) {
            let title = 'Name';
            rows = results.data;
            let items = Object();
            items.length = 0;
            items.data = Object();

            for (let i = 0; i < rows.length; i++) {
                row = rows[i]

                if (i == 0) {
                    second = row.slice(8, 16);
                    distance = row[16];
                }
                else {
                    title1 = row[1];
                    title2 = row[9];
                    properties1 = row.slice(0, 8);
                    properties2 = row.slice(8, 16);
                    distance = row[16];

                    if (distance < 16.0934) {
                        if (items['data'].hasOwnProperty(title1) == false) {
                            let program = new Program(title1, properties1);
                            program.addNeighbor(title2);
                            program.type = 'first';
                            items['data'][title1] = program;
                            items['length'] = items['length'] + 1
                        } else {
                            items['data'][title1].addNeighbor(title2);
                        }
                        

                        if (items['data'].hasOwnProperty(title2) == false) {
                            let program = new Program(title2, properties2);
                            program.addNeighbor(title1);
                            program.type = 'second';
                            items['data'][title2] = program;
                            items['length'] = items['length'] + 1
                        } else {
                            items['data'][title2].addNeighbor(title1);
                        }
                    }
                }
            }

            loadMap(items);
	}
    });
}

function loadMap(items) {
    var map = L.map('map').setView([37.8, -96], 4);

    var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
		     'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/light-v9',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);

    var sidebar = L.control.sidebar('sidebar', {
        closeButton: true,
        position: 'left'
    });
    map.addControl(sidebar);

    var firstIcon = new L.icon({
        iconUrl: 'images/youth_build_icon.png',
        iconSize: [35, 27],
    });

    var secondIcon = new L.icon({
        iconUrl: 'images/strive_together_icon.png',
        iconSize: [35, 35],
    })

    var circle;

    for (let [key, item] of Object.entries(items.data)) {
        let properties = item['properties'];
        let lat = properties[6];
        let lon = properties[7];
        let marker;

        if (item['type'] == 'first') {
            marker = new L.marker([lat,lon], {icon: firstIcon}).addTo(map);
        } else {
            marker = new L.marker([lat,lon], {icon: secondIcon}).addTo(map);
        }

        marker.on("click", function(e) {
            if (circle != undefined) {
                map.removeLayer(circle);
            }

            circle = L.circle(e.latlng, 1609 * 10, {
                color: '#f07300',
                fillOpacity: 0,
                opacity: 0.5
            }).addTo(map);
            map.setView(e.latlng, 11);
            sidebarHtml = document.getElementById("sidebar");

            let neighborsHtml = '';

            if (item.neighbors.length > 0) {
                neighborsHtml = '<div><b>Nearby programs</b></div>' +
                                '<div><ul>';

                for (let i = 0; i < item.neighbors.length; i++) {
                    neighborsHtml = neighborsHtml + '<li>' + item.neighbors[i] + '</li>';
                }

                neighborsHtml = neighborsHtml + '</ul></div>';
            }

            sidebarHtml.innerHTML = '<div><b>Organization</b></div>' +
                                    '<div>' + properties[0] + '<br><br></div>' +
                                    '<div><b>Program Name</b></div>' +
                                    '<div>' + properties[1] + '<br><br></div>' +
                                    '<div><b>Street Address</b></div>' +
                                    '<div>' + properties[2] + '<br><br></div>' +
                                    '<div><b>City</b></div>' +
                                    '<div>' + properties[3] + '<br><br></div>' +
                                    '<div><b>State</b></div>' +
                                    '<div>' + properties[4] + '<br><br></div>' +
                                    neighborsHtml;

            sidebar.show();
        });

        map.on('click', function(e) {
            if (circle != undefined) {
                map.removeLayer(circle);
            }

            sidebar.hide();
        });
    }
}

var source = new EventSource('/stream');
var sensors = new Map();

source.onmessage = function (event) {
    sensor_data = JSON.parse(event.data);
    console.log(sensor_data);

    if (!sensors.has(sensor_data.sensor_id)) {

        $("#sensors").append(`<div class="card bg-light mb-3">
    <div class="card-header">
        ${sensor_data.sensor_id}
        <small class="float-sm-right">
            <div class="dropdown show">
                <a class="btn-sm btn-primary dropdown-toggle" href="#" role="button" id="dropdownMenuLink"
                   data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Options
                </a>

                <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                    <a class="dropdown-item" href="#">Alertes</a>
                    <a class="dropdown-item" href="#">Renommer</a>
                </div>
            </div>
        </small>
    </div>
    <div class="card-body">
        <div class="container">
            <div class="row">
                <div class="col">
                    <h5>Pression : <span id="actual_pressure_${sensor_data.sensor_id}"></span> mbar</h5>
                    <canvas id="pressure_${sensor_data.sensor_id}" width="300" height="100"></canvas>
                </div>
                <div class="col">
                    <h5>Température :  <span id="actual_temp_${sensor_data.sensor_id}"></span> °C</h5>
                    <canvas id="temp_${sensor_data.sensor_id}" width="300" height="100"></canvas>
                </div>

            </div>
        </div>
    </div>
</div>
</div>
</div>
`);

        var ts_t = new TimeSeries();
        var ts_p = new TimeSeries();
        var chart_t = new SmoothieChart({millisPerPixel: 150, grid: {millisPerLine: 10000}});
        var chart_p = new SmoothieChart({millisPerPixel: 150, grid: {millisPerLine: 10000}});

        chart_t.addTimeSeries(ts_t, {
            strokeStyle: 'rgba(0, 255, 0, 1)',
            fillStyle: 'rgba(0, 255, 0, 0.2)',
            lineWidth: 2
        });
        chart_p.addTimeSeries(ts_p, {
            strokeStyle: 'rgb(255,0,0)',
            fillStyle: 'rgba(255, 0, 0, 0.2)',
            lineWidth: 2
        });

        chart_t.streamTo(document.getElementById("pressure_" + sensor_data.sensor_id), 500);
        chart_p.streamTo(document.getElementById("temp_" + sensor_data.sensor_id), 500);

        sensors.set(sensor_data.sensor_id, {t: ts_t, p: ts_p, c_t: chart_t, c_p: chart_p});
    }

    sensors.get(sensor_data.sensor_id).t.append(new Date(sensor_data.time), sensor_data.t);
    sensors.get(sensor_data.sensor_id).p.append(new Date(sensor_data.time), sensor_data.p);

    $("#actual_temp_"+sensor_data.sensor_id).html(sensor_data.t.toFixed(2));
    $("#actual_pressure_"+sensor_data.sensor_id).html(sensor_data.p.toFixed(2));
};
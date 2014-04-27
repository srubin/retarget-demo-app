/** @jsx React.DOM */
var RetargetTime = React.createClass({
    render: function() {
        return <div className="well"><p className="lead">Target duration</p>
        <input type="number" placeholder="minutes" size="7"
        ref="minutes"
        value={parseInt(this.state.seconds / 60, 10)}
        onChange={this.onChange} /> :&nbsp;
        <input type="number" placeholder="seconds" size="7"
        ref="seconds"
        value={parseInt(this.state.seconds % 60, 10)}
        onChange={this.onChange} />
        </div>;
    },
    getInitialState: function() {
        return {seconds:parseInt(this.props.seconds, 10)};
    },
    onChange: function(event) {
        var minutes = parseInt(this.refs.minutes.getDOMNode().value, 10);
        var seconds = parseInt(this.refs.seconds.getDOMNode().value, 10);
        if (isNaN(minutes)) {
            minutes = 0;
        }
        if (isNaN(seconds)) {
            seconds = 0;
        }
        var totalSeconds = 60 * minutes + seconds;
        console.log("total seconds", totalSeconds);
        this.setState({seconds: totalSeconds});
        this.props.onChange(totalSeconds);
    }
});

var RetargetSettings = React.createClass({
    render: function() {
        return <div className="well">
        <p className="lead">Settings</p>
        <input type="checkbox" name="startAtStart" id="startAtStart"
            checked={this.state.startAtStart}
            onChange={this.handleChange.bind(this, 'startAtStart')}
        > 
            <label htmlFor="startAtStart">&nbsp;Start at beginning of music</label>
        </input><br />
        <input type="checkbox" name="endAtEnd" id="endAtEnd"
            checked={this.state.endAtEnd}
            onChange={this.handleChange.bind(this, 'endAtEnd')}
        > 
            <label htmlFor="endAtEnd">&nbsp;End at end of music</label>
        </input>
        </div>;
    },
    getInitialState: function() {
        return {
            startAtStart: this.props.startAtStart,
            endAtEnd: this.props.endAtEnd
        };
    },
    handleChange: function(field, event) {
        var state = {};
        state[field] = event.target.checked;
        this.setState(state); 
        this.props.onChange(state);
    }
});

var RetargetUploadForm = React.createClass({
    render: function() {
        return  <form id="uploadForm" method="POST" enctype="multipart/form-data">
        <div className="fileinput fileinput-new input-group" data-provides="fileinput">
            <div className="form-control" data-trigger="fileinput">
                <i className="glyphicon glyphicon-file fileinput-exists"></i>
                <span className="fileinput-filename"></span>
            </div>
            <span className="input-group-addon btn btn-default btn-file">
                <span className="fileinput-new">Select music track</span>
                <span className="fileinput-exists">Change</span>
                <input type="file" name="song" onChange={this.onChange} />
            </span>
            <a href="#" className="input-group-addon btn btn-default fileinput-exists" data-dismiss="fileinput">
                Remove
            </a>
        </div></form>;
    },
    onChange: function() {
        this.props.onChange();
    }
});

var Retarget = React.createClass({
    render: function() {
        var items = {};
        this.state.results.forEach(function(result) {
            items['result-' + result.id] = <li><a href={result.url}>{result.text}</a></li>;
        });

        return <div>
        <div className="col-lg-6">
            <div className="well">
                <p className="lead">Music</p>
                <RetargetUploadForm onChange={this.dirtyTrack} />
                <input type="text" value={this.state.trackName} onChange={this.updateTrackName} />
            </div>
            <RetargetTime onChange={this.updateTime} seconds={90} />
            <RetargetSettings onChange={this.updateSettings} startAtStart={true} endAtEnd={true} />
        </div>
        <div className="col-lg-6">
            <div>
                <button onClick={this.retarget} className="btn btn-success btn-block btn-lg">Retarget</button>
                <span> {this.state.status}</span>
            </div>
            <div>
                <ul className="playlist">
                {items}
                </ul>
            </div>
        </div>
        </div>;
    },
    getInitialState: function() {
        return {
            status: "",
            results: [],
            seconds: 90,
            trackName: "Track name",
            startAtStart: true,
            endAtEnd: true,
            uploadedTrack: false,
            trackPath: null
        };
    },
    updateTrackName: function(event) {
        this.setState({trackName: event.target.value});
    },
    updateTime: function(secs) {
        this.setState({seconds: secs});
    },
    updateSettings: function(settings) {
        this.setState(settings);
    },
    dirtyTrack: function() {
        this.setState({uploadedTrack: false});
    },
    getName: function() {
        var start = 'freeStart';
        var end = 'freeEnd';
        if (this.state.startAtStart) {
            start = 'fixStart';
        }
        if (this.state.endAtEnd) {
            end = 'fixEnd';
        }
        return '' + this.state.trackName + ' (' +
            this.state.seconds + ', ' + start + ', ' + end + ')';
    },
    retarget: function() {
        var opts = {
            lines: 9, // The number of lines to draw
            length: 0, // The length of each line
            width: 16, // The line thickness
            radius: 36, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1.2, // Rounds per second
            trail: 45, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };
        var spinner = new Spinner(opts).spin($('body')[0]);

        var _this = this;

        var retargetFn = function() {
            _this.setState({
                status: "Retargeting track (this can take several minutes if it's the first time retargeting a track)"}
            );
            var start = "no";
            var end = "no";
            if (_this.state.startAtStart) {
                start = "start";
            }
            if (_this.state.endAtEnd) {
                end = "end";
            }
            var url = "retarget-service/retarget/" +
                _this.state.trackPath + '/' + 
                _this.state.seconds + '/' +
                start + '/' + end;

            $.ajax({
                type: "GET",
                url: url,
                success: function(data) {
                    var results = _this.state.results;
                    results.push({
                        text: _this.getName(),
                        url: data,
                        id: '' + Math.random()
                    });
                    _this.setState({results: results});
                    spinner.stop();
                    _this.setState({status: ""});
                }
            });
        };

        if (!this.state.uploadedTrack) {
            $("#uploadForm").submit(function(event) {
                var formData = new FormData($('#uploadForm')[0]);
                _this.setState({status: "Uploading track"});
                $.ajax({
                       type: "POST",
                       url: "retarget-service/uploadTrack",
                       data: formData,
                       cache: false,
                       contentType: false,
                       processData: false,
                       success: function(data) {
                            _this.setState({
                                uploadedTrack: true,
                                trackName: data.title,
                                trackPath: data.filename
                            });
                            retargetFn();
                       }
                });
                event.preventDefault();
            }).submit();
        } else {
            retargetFn();
        }

    }
});

React.renderComponent(
    <Retarget />,
    document.getElementById('retarget')
);

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
            <label htmlFor="endAtEnd">&nbsp;End at end of music (roughly)</label>
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
        var stockTrackOptions = {};
        this.props.stockTracks.forEach(function (stockTrack) {
            stockTrackOptions[stockTrack.trackArtist + stockTrack.trackName] = <option value={stockTrack.trackPath}>{stockTrack.trackName} - {stockTrack.trackArtist}</option>;
        });
        var stockChecked = (this.state.musicSource == 'stock');
        var uploadChecked = (this.state.musicSource == 'upload');
        return  <form id="uploadForm" method="POST" encType="multipart/form-data">
        <div className="row">
            <div className="col-lg-5">
                <input name="musicSource" id="musicSourceStock" value="stock" type="radio" checked={stockChecked} onChange={this.handleChange} />
                <label htmlFor="musicSourceStock">&nbsp;Pre-analyzed music:</label>
            </div>
        </div>
        <div className="row">
            <div className="col-lg-12">
                <select ref="trackSelect" data-placeholder="Choose music..." className="chosen-select" onChange={this.handleChange}>
                    <option value=''></option>
                    {stockTrackOptions}
                </select>
            </div>
        </div>
        <br />
        <div className="row">
            <div className="col-lg-12">
                <input name="musicSource" id="musicSourceUpload" value="upload" type="radio" checked={uploadChecked} onChange={this.handleChange} />
                <label htmlFor="musicSourceUpload">&nbsp;Or, upload an mp3:</label>
            </div>
        </div>
        <div className="row">
            <div className="col-lg-12">
                <div className="fileinput fileinput-new input-group" data-provides="fileinput">
                    <div className="form-control" data-trigger="fileinput">
                        <i className="glyphicon glyphicon-file fileinput-exists"></i>
                        <span className="fileinput-filename"></span>
                    </div>
                    <span className="input-group-addon btn btn-default btn-file">
                        <span className="fileinput-new">Select music track</span>
                        <span className="fileinput-exists">Change</span>
                        <input type="file" name="song" />
                    </span>
                    <a href="#" className="input-group-addon btn btn-default fileinput-exists" data-dismiss="fileinput">
                        Remove
                    </a>
                </div>
            </div>
        </div>
        </form>;
    },
    getInitialState: function() {
        return {
            musicSource: this.props.musicSource,
            trackName: this.props.trackName,
            trackPath: undefined,
            trackDuration: undefined
        };
    },
    handleChange: function() {
        var trackName = this.state.trackName;
        var trackPath = this.state.trackPath;
        var trackDuration = this.state.trackDuration;
        var musicSource = $('input[name=musicSource]:checked', '#uploadForm').val();
        if (musicSource === 'stock') {
            trackPath = $(this.refs.trackSelect.getDOMNode()).val();
            this.props.stockTracks.forEach(function (track) {
                if (track.trackPath === trackPath) {
                    trackName = track.trackName;
                    trackDuration = track.trackDuration;
                }
            });
        }
        if (musicSource === 'upload' && this.state.musicSource === 'stock') {
            trackName = 'Track name';
            trackDuration = undefined;
            trackPath = undefined;
        }
        var newState = {
            trackName: trackName,
            trackPath: trackPath,
            musicSource: musicSource,
            trackDuration: trackDuration
        }
        this.setState(newState);
        this.props.onChange(newState);
    },
    componentDidMount: function() {
        $(this.refs.trackSelect.getDOMNode()).chosen().change(this.handleChange);
    }
});

var Retarget = React.createClass({
    render: function() {
        var status = '';
        if (this.state.status !== '') {
            status = <div className="alert alert-warning"> {this.state.status}</div>;
        }
        var items = {};
        this.state.results.forEach(function(result) {
            items['result-' + result.id] = <li>
                <a href={result.url}>{result.text}
                <br />
                {result.details}
                </a>
                </li>;
        });

        var player = '';
        if (this.state.trackPath !== undefined) {
            var pathLen = this.state.trackPath.length;
            var mp3Path = this.state.trackPath.substring(0, pathLen - 3) + 'mp3';
            if (this.state.musicSource === 'stock') {
                player = <ul className="playlist">
                    <a href={"/retarget-service/static/stock/" + mp3Path}>Original track</a>
                    </ul>;
            } else if (this.state.uploadedTrack) {
                player = <ul className="playlist">
                    <li><a href={"/retarget-service/static/uploads/" + mp3Path}>Original track</a></li>
                    </ul>;   
            }
        }

        return <div>
        <div className="col-lg-6">
            <div className="well">
                <p className="lead">Select music</p>
                <RetargetUploadForm musicSource={this.state.musicSource} trackName={this.state.trackName} onChange={this.updateSettings} stockTracks={this.state.stockTracks} />
            </div>
            <div className="well">
                <p className="lead">Music details</p>
                <p><strong>Track name:</strong> {this.state.trackName}</p>
                <p><strong>Track duration:</strong> {this.niceDuration(this.state.trackDuration)}</p>
                {player}
            </div>
            <RetargetTime onChange={this.updateTime} seconds={90} />
            <RetargetSettings onChange={this.updateSettings} startAtStart={true} endAtEnd={true} />
        </div>
        <div className="col-lg-6">
            <div className="row">
                <div className="col-lg-6">
                    <div>
                        <button onClick={this.retarget} className="btn btn-success btn-block btn-lg">Retarget</button>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div>
                        <button onClick={this.clearResults} className="btn btn-block btn-lg">Clear all results</button>
                    </div>
                </div>
            </div>
                    
            <div>
                {status}
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
            trackDuration: undefined,
            startAtStart: true,
            endAtEnd: true,
            uploadedTrack: false,
            trackPath: undefined,
            fileinputFilename: undefined,
            stockTracks: stockTracks,
            musicSource: 'stock'
        };
    },
    niceDuration: function(dur) {
        if (dur !== undefined) {
            var seconds = parseInt(dur % 60, 10);
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            var minutes = parseInt(dur / 60, 10);
            return +minutes + ':' + seconds;
        }
        return '';
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
    getName: function() {
        var start = 'freeStart';
        var end = 'freeEnd';
        if (this.state.startAtStart) {
            start = 'fixStart';
        }
        if (this.state.endAtEnd) {
            end = 'fixEnd';
        }

        var name = '' + this.state.trackName + ' (' +
            this.state.seconds + ', ' + start + ', ' + end + ')';
        return name;
    },
    getDetails: function(transitions) {
        var name = 'Transitions: ';
        transitions.forEach(function (t) {
            name += t[0] + 'sec, c: ' + t[1] + '; ';
        });
        return name;
    },
    componentDidMount: function() {
        var _this = this;

        $("#uploadForm").submit(function(event) {
            var formData = new FormData($('#uploadForm')[0]);
            _this.setState({status: "Uploading track"});
            $.ajax({
                type: "POST",
                url: "/retarget-service/uploadTrack",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                success: function(data) {
                    _this.setState({
                        uploadedTrack: true,
                        trackName: data.title,
                        trackDuration: data.duration,
                        trackPath: data.filename
                    });
                    _this._retargetFn();
                },
                error: function() {
                    _this.setState({
                        status: "Could not upload track. Select an mp3 to upload"
                    });
                    _this.state.spinner.stop()
                }
            });
            event.preventDefault();
        });
    },
    _retargetFn: function() {
        this.setState({
            status: "Retargeting track (this can take several minutes if it's the first time retargeting this track)"}
        );
        var start = "no";
        var end = "no";
        if (this.state.startAtStart) {
            start = "start";
        }
        if (this.state.endAtEnd) {
            end = "end";
        }
        var url = "/retarget-service/retarget/" +
            this.state.trackPath + '/' + 
            this.state.musicSource + '/' +
            this.state.seconds + '/' +
            start + '/' + end;

        var _this = this;

        $.ajax({
            type: "GET",
            url: url,
            success: function(data) {
                var results = _this.state.results;
                results.push({
                    text: _this.getName(),
                    details: _this.getDetails(data.transitions),
                    url: data.url,
                    id: '' + Math.random()
                });
                _this.setState({results: results});
                _this.state.spinner.stop();
                _this.setState({status: ""});
            },
            error: function () {
                _this.setState({
                    status: "Could not retarget track."
                });
                _this.state.spinner.stop();
            }
        });
    },
    clearResults: function() {
        this.setState({results: []});
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

        this.setState({spinner: spinner});

        var _this = this;

        var fifn = $(".fileinput-filename").text();
        var upload = false;
        if (fifn !== this.state.fileinputFilename) {
            this.setState({
                fileinputFilename: fifn,
                uploadedTrack: false,
                trackPath: undefined
            });
            var upload = true;
        }

        if (upload && this.state.musicSource === 'upload') {
            $("#uploadForm").submit();
        } else if (this.state.musicSource === 'stock' && this.state.trackPath === undefined) {
            this.setState({status: "You must select a track to retarget"});
            spinner.stop();
        } else {
            this._retargetFn();
        }

    }
});

React.renderComponent(
    <Retarget />,
    document.getElementById('retarget')
);

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
        return  <form action="retarget-service/uploadTrack" id="uploadForm" method="POST" enctype="multipart/form-data">
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
        </div></form>;
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
                <RetargetUploadForm />
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
        if (this.state.uploadedTrack)

        this.setState({status: "Computing..."});
        var results = this.state.results;
        results.push({
            text: this.getName(),
            url: 'test.mp3',
            id: '' + Math.random()
        });
        this.setState({results: results});
    }
});

React.renderComponent(
    <Retarget />,
    document.getElementById('retarget')
);

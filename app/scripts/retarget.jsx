/** @jsx React.DOM */
var RetargetTime = React.createClass({
    render: function() {
        return <form className="well"><p className="lead">Target duration</p>
        <input type="number" placeholder="minutes" size="7"
        ref="minutes"
        value={parseInt(this.state.seconds / 60, 10)}
        onChange={this.onChange} /> :&nbsp;
        <input type="number" placeholder="seconds" size="7"
        ref="seconds"
        value={parseInt(this.state.seconds % 60, 10)}
        onChange={this.onChange} />
        </form>;
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
        return {startAtStart: true, endAtEnd: true};
    },
    handleChange: function(field, event) {
        var state = {};
        state[field] = event.target.checked;
        this.setState(state); 
        this.props.onChange(state);
    }
});

var RetargetResult = React.createClass({
    render: function() {
        return <ul className="player">
        <li><a href={this.props.trackUrl}>Retargeted result</a></li>
        </ul>;
    }
});

var Retarget = React.createClass({
    render: function() {
        var items = {};
        this.state.results.forEach(function(result) {
            items['result-' + result.id] = <li><a href={result.url}>{result.text}</a></li>;
        });

        return <div>
        <div className="col-lg-4"><RetargetTime onChange={this.updateTime} seconds={90} /></div>
        <div className="col-lg-4"><RetargetSettings onChange={this.updateSettings} /></div>
        <div className="col-lg-4">
            <div>
                <button onClick={this.retarget} className="btn btn-success">Retarget</button>
                <span> {this.state.status}</span>
            </div>
            <div>
                <ul className="player">
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
            seconds: 90
        };
    },
    updateTime: function(secs) {
        this.setState({seconds: secs});
    },
    updateSettings: function(settings) {
        this.setState(settings);
    },
    retarget: function() {
        this.setState({status: "Computing..."});
        var results = this.state.results;
        results.push({
            text: 'Result - ' + this.state.seconds,
            url: '#',
            id: '' + Math.random()
        });
        this.setState({results: results});
    }
});

React.renderComponent(
    <Retarget />,
    document.getElementById('retarget')
);

/** @jsx React.DOM */
var RetargetTime = React.createClass({
    render: function() {
        return <form className="well"><p className="lead">Target duration</p>
        <input type="number" placeholder="minutes" size="7"
        ref="minutes"
        value={parseInt(this.state.seconds / 60, 10)}
        onChange={this.onChange} />
            : &nbsp;
        <input type="number" placeholder="seconds" size="7"
        ref="seconds"
        value={parseInt(this.state.seconds % 60, 10)}
        onChange={this.onChange} />
        </form>;
    },
    getInitialState: function() {
        return {seconds:90};
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
        this.setState({seconds: 60 * minutes + seconds});
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
    }
});

var Retarget = React.createClass({
    render: function() {
        return <div><div className="col-lg-4"><RetargetTime /></div>
        <div className="col-lg-4"><RetargetSettings /></div></div>;
    }
});

React.renderComponent(
    <Retarget />,
    document.getElementById('retarget')
);

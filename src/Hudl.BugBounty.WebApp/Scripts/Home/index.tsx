// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />
import React =  require('react');
import ReactDOM = require('react-dom');

var Test = React.createClass<{}, {}>({
    render: function () {
        return (<div>
                  Hello Bounty Hunters
                </div>);        
    }
});

ReactDOM.render(<Test />, document.getElementById('content')); 

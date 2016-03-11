// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="../../typings/tsd.d.ts" />

import React = require('react');
import ReactDOM = require('react-dom');
import $ = require('jquery');

module Hit {

    // interfaces
    export interface IHitProps {
        dataUrl: string;
    }

    //implementations
    export class Hit {
        key: string;
        signature: string;
        service: string;
        description: string;
        stacktrace: string;
        firstOccurrance: any;
        currentValue: number;

        constructor(data?: any) {
            if (!data) {
                console.log('no data provided');
                return;
            }

            console.log('data provided');
            this.key = data.key;
            this.signature = data.Signature;
            this.service = data.Service;
            this.description = data.Description;
            this.stacktrace = data.Stacktrace;
            this.firstOccurrance = data.firstOccurrance;
            this.currentValue = data.currentValue;
        }
    }

    export class HitComponent extends React.Component<IHitProps, {}>{
        constructor(props: IHitProps) {
            super(props);
            console.log('hitcomponent props=', props);
            this.model = new Hit();
        }
        public loadDataFromServer() {
            var hit = this;
            if (!hit.props) {
                return;
            }
            $.ajax({
                url: hit.props.dataUrl,
                dataType: 'json',
                cache: false,
                success: data => {
                    hit.model = new Hit(data);
                    hit.setState({loaded:true});
                },
                error: (xhr, status, err) => {
                    console.error(this.props.dataUrl, status, err.toString());
                }
            });
        }

        componentDidMount() {
            this.loadDataFromServer();
        }
        public render() {
            return (
                <div className="hit-container" key={this.model.key}>
                    <div className="hit-item signature">Signature: {this.model.signature}</div>
                    <div className="hit-item service">Service: {this.model.service}</div>
                    <div className="hit-item description">Description: {this.model.description}</div>
                    <div className="hit-item stacktrace">Stacktrace: {this.model.stacktrace}</div>
                    <div className="hit-item firstOccurrence">First Occurrence: {this.model.firstOccurrance}</div>
                    <div className="hit-item currentValue">Current Value: {this.model.currentValue}</div>
                </div>
            );
        }

        model: Hit;
    }

}

var hitElem = document.getElementById('hit-content');
var App = Hit.HitComponent;
declare var hitId: string;

console.log('hitId=', hitId);
ReactDOM.render(<App dataUrl={'/api/hit/' + hitId} />, hitElem);
if (hitElem && hitId) {
    //ReactDOM.render(<App model={model} />, hitElem);
}

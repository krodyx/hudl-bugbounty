// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/classnames/classnames.d.ts" />
import React = require('react');
import ReactDOM = require('react-dom');
import classNames = require('classnames');
import $ = require('jquery');

module HitBoard {

    // interfaces
    export interface IHitBoardItem {
        position: number;
        signature: string;
        serviceName: string;
        description: string;
        value: number;
        assigned: boolean;
    }

    export interface IHitBoardItemProps {
        position: number;
        data: HitData;
    }

    export interface IHitBoardModel {
        bountyBoardItems: Array<IHitBoardItem>;
    }

    export interface IHitBoardState {
        isVisible: boolean;
    }

    export interface IHitBoardProps {
        Title: string;
        url: string;
        pollInterval: number;
    }

    export class HitData {
        key: string;
        Signature: string;
        Service: string;
        Description: string;
        Stacktrace: string;
        FirstOccurrance: any;
        CurrentValue: number;
    }

    export class BountyData {
        HitId: string;
        Hit: HitData;
        SquadName: string;
        DateCollected: any;
        Value: number;
    }

    export class HitBoardItem implements IHitBoardItem {

        private _position: number;
        private _signature: string;
        private _serviceName: string;
        private _description: string;
        private _stacktrace: string;
        private _value: number;
        private _assigned: boolean;

        get position() {
            return this._position;
        }

        get signature() {
            return this._signature;
        }

        get serviceName() {
            return this._serviceName;
        }

        get description() {
            return this._description;
        }

        get stackgrace() {
            return this._stacktrace;
        }

        get assigned() {
            return this._assigned;
        }

        get value() {
            return this._value;
        }

        constructor(position: number, signature: string, serviceName: string, description: string, stacktrace: string, value: number) {
            this._position = position;
            this._signature = signature;
            this._serviceName = serviceName;
            this._description = description;
            this._stacktrace = stacktrace;
            this._value = value;
        }
    }

    export class HitBoardItemComponent extends React.Component<IHitBoardItemProps, {}>{
        private model: HitBoardItem;
        constructor(props: IHitBoardItemProps) {
            super(props);
            var data = props.data;
            var missing = "<missing>";
            var hit = data || {
                "key": missing,
                "Service": missing,
                "Description": missing,
                "Stacktrace": missing,
                "CurrentValue": 0
            };
            this.model = new HitBoardItem(props.position, hit.key, hit.Service, hit.Description || missing, hit.Stacktrace, hit.CurrentValue);
        }

        public render() {
            var model = this.model;
            var assignedClass = classNames({
                "hitboard-item assigned": model.assigned,
                "hitboard-item unassigned": !model.assigned
            });
            var assignedValue = model.assigned ? "Assigned" : "Not Assigned";
            return (<div className="hitboard-item-container">
                <div className="hitboard-item position">{model.position}</div>
                <div className="hitboard-item signature">
                    <a href={'/hits/' + model.signature}>{model.signature}</a>
                </div>
                <div className="hitboard-item serviceName">{model.serviceName}</div>
                <div className="hitboard-item description">{model.description}</div>
                <div className={assignedClass}>{assignedValue}</div>
                <div className="hitboard-item value points"> {model.value} </div>
            </div>
            );
        }
    }

    export class HitBoardModel implements IHitBoardModel {
        private _bountyBoardItems: Array<IHitBoardItem>;
        get bountyBoardItems() {
            return this._bountyBoardItems;
        }

        constructor(bountyBoardItems: Array<IHitBoardItem>) {
            this._bountyBoardItems = bountyBoardItems;
        }
    }

    export class HitBoardComponent extends React.Component<IHitBoardProps, any>{

        constructor(props: IHitBoardProps) {
            super(props);
            this.state = {
                data: []
            };
        }

        public loadDataFromServer() {
            var board = this;
            if (!board.props) {
                return;
            }
            $.ajax({
                url: board.props.url,
                dataType: 'json',
                cache: false,
                success: data => {
                    board.setState({ data: data });
                },
                error: (xhr, status, err) => {
                    console.error(this.props.url, status, err.toString());
                }
            });
        }

        componentDidMount() {
            this.loadDataFromServer();
            setInterval(this.loadDataFromServer, this.props.pollInterval || 5000);
        }

        public render() {
            var pos = 0;
            var bounties = this.state.data.map(i => {
                return (<li key={pos++}>
                    <HitBoardItemComponent data={i} position={pos} />
                </li>);
            });
            return (<div className="hitboard-container">
                <div className="hitboard-header">
                    <span className="hitboard-header-title">{this.props.Title}</span>
                </div>
                <ul className="hits">
                    <div className="hitboard-item-container">
                        <div className="headers">
                            <div className="rank">Rank</div>
                            <div className="sig">Signature</div>
                            <div className="service">Service</div>
                            <div className="description">Description</div>
                            <div className="assigned">Assigned</div>
                            <div className="points">Points</div>
                        </div>
                    </div>
                    {bounties}
                </ul>
            </div>);
        }
    }
}

var App = HitBoard.HitBoardComponent;

var hitsElem = document.getElementById('hits-content');
if (hitsElem) {
    ReactDOM.render(<App
        Title="Top Bounties"
        url="/api/hits"
        pollInterval={5000} />, hitsElem);
} else {
    console.log('hitsElem not found');
}

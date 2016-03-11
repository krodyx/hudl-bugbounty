// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../typings/classnames/classnames.d.ts" />
import React = require('react');
import ReactDOM = require('react-dom');
import classNames = require('classnames');
import $ = require('jquery');

module BountyBoard {

    // interfaces
    export interface IBountyBoardItem {
        position: number;
        signature: string;
        serviceName: string;
        description: string;
        value: number;
        assigned: boolean;
    }

    export interface IBountyBoardItemProps {
        position: number;
        data: BountyData;
    }

    export interface IBountyBoardModel {
        bountyBoardItems: Array<IBountyBoardItem>;
    }

    export interface IBountyBoardState {
        isVisible: boolean;
    }

    export interface IBountyBoardProps {
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

    export class BountyBoardItem implements IBountyBoardItem {

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

    export class BountyBoardItemComponent extends React.Component<IBountyBoardItemProps, {}>{
        private model: BountyBoardItem;
        constructor(props: IBountyBoardItemProps) {
            super(props);
            var data = props.data;
            var missing = "<missing>";
            var hit = data.Hit || {
                "Service": missing,
                "Description": missing,
                "Stacktrace": missing,
                "CurrentValue": 0
            };
            this.model = new BountyBoardItem(props.position, data.HitId, hit.Service, hit.Description || missing, hit.Stacktrace, hit.CurrentValue);
        }

        public render() {
            var model = this.model;
            var assignedClass = classNames({
                "bountyboard-item assigned": model.assigned,
                "bountyboard-item unassigned": !model.assigned
            });
            var assignedValue = model.assigned ? "Assigned" : "Not Assigned";
            return (<div className="bountyboard-item-container">
                <div className="bountyboard-item position">{model.position + 1}</div>
                <div className="bountyboard-item signature">{model.signature}</div>
                <div className="bountyboard-item serviceName">{model.serviceName}</div>
                <div className="bountyboard-item description">{model.description}</div>
                <div className={assignedClass}>{assignedValue}</div>
                <div className="bountyboard-item value points"> {model.value} </div>
            </div>
            );
        }
    }

    export class BountyBoardModel implements IBountyBoardModel {
        private _bountyBoardItems: Array<IBountyBoardItem>;
        get bountyBoardItems() {
            return this._bountyBoardItems;
        }

        constructor(bountyBoardItems: Array<IBountyBoardItem>) {
            this._bountyBoardItems = bountyBoardItems;
        }
    }

    export class BountyBoardComponent extends React.Component<IBountyBoardProps, any>{

        constructor(props: IBountyBoardProps) {
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
                    <BountyBoardItemComponent data={i} position={pos} />
                </li>);
            });
            return (<div className="bountyboard-container">
                <div className="bountyboard-header">
                    <span className="bountyboard-header-title">{this.props.Title}</span>
                </div>
                <ul className="bounties">
                    <div className="bountyboard-item-container">
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

var App = BountyBoard.BountyBoardComponent;

var bountiesElem = document.getElementById('bounties-content');
if (bountiesElem) {
    ReactDOM.render(<App
        Title="Top Bounties"
        url="/api/bounties"
        pollInterval={5000} />, bountiesElem);
}

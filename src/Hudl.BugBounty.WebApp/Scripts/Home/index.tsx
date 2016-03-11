// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="../../typings/tsd.d.ts" />

import React = require('react');
import ReactDOM = require('react-dom');
import $ = require('jquery');

module Leaderboard {

    // interfaces
    export interface ILeaderboardItem {
        id: number;
        position: number;
        squadName: string;
        squadImageUrl: string;
        timeframePoints: number;
        alltimePoints: number;
        daysChange: number;
    }

    export interface ILeaderboardItemProps {
        model: ILeaderboardItem;
    }

    export interface ILeaderboardColumnModel {
        leaderboardItems: Array<ILeaderboardItem>;
        fromDate: Date;
        title: string;
    }

    export interface ILeaderboardColumnState {
        isShowing: boolean;
    }

    export interface ILeaderboardColumnProps {
        model: ILeaderboardColumnModel;
        bountiesUrl: string;
    }

    //implementations
    export class LeaderboardItem implements ILeaderboardItem {
        static LeaderboardItemId: number = 0;

        private _id: number;
        private _position: number;
        private _squadName: string;
        private _squadImageUrl: string;
        private _timeframePoints: number;
        private _alltimePoints: number;
        private _daysChange: number;

        get id() {
            return LeaderboardItem.LeaderboardItemId++;
        }

        get position() {
            return this._position;
        }

        get squadName() {
            return this._squadName;
        }

        get squadImageUrl() {
            return this._squadImageUrl;
        }

        get timeframePoints() {
            return this._timeframePoints;
        }

        get alltimePoints() {
            return this._alltimePoints;
        }

        get daysChange() {
            return this._daysChange;
        }

        constructor(position: number, squadName: string, squadImageUrl: string, timeframePoints: number, alltimePoints: number, dayChange: number) {
            this._position = position;
            this._squadName = squadName;
            this._squadImageUrl = squadImageUrl;
            this._timeframePoints = timeframePoints;
            this._alltimePoints = alltimePoints;
            this._daysChange = dayChange;
        }
    }

    export class LeaderboardItemComponent extends React.Component<ILeaderboardItemProps, {}>{
        constructor(props: ILeaderboardItemProps) {
            super(props);
        }

        public render() {
            return (<div className="leaderboard-item-container">
                <span className="leaderboard-item-position">Pos: {this.props.model.position}</span>
                <div className="leaderboard-item-squad-image">Image: <img src={this.props.model.squadImageUrl}></img></div>
                <span className="leaderboard-item-squad">
                    <div className="leaderboard-item-squad-squadname">Name: {this.props.model.squadName}</div>
                    <div className="leaderboard-item-squad-alltimepoints">AllPoints: {this.props.model.alltimePoints}</div>
                </span>
                <span className="leaderboard-item-points">
                    <div className="leaderboard-item-points-timeframepoints">Points: {this.props.model.timeframePoints}</div>
                    <div className="leaderboard-item-points-change">Change: {this.props.model.daysChange}</div>
                </span>
            </div>);
        }
    }

    export class LeaderboardColumnModel implements ILeaderboardColumnModel {
        private _leaderboardItems: Array<ILeaderboardItem>;
        private _fromDate: Date;
        private _title: string;
        get leaderboardItems() {
            return this._leaderboardItems;
        }

        get fromDate() {
            return this._fromDate;
        }

        get title() {
            return this._title;
        }

        public addLeaderboardItem(leaderboardItem: ILeaderboardItem) {
            this.leaderboardItems.push(leaderboardItem);
        }

        constructor(leaderboardItems: Array<ILeaderboardItem>, fromDate: Date, title: string) {
            this._leaderboardItems = leaderboardItems;
            this._fromDate = fromDate;
            this._title = title;
        }
    }

    export class LeaderboardColumnComponent extends React.Component<ILeaderboardColumnProps, ILeaderboardColumnState>{
        constructor(props: ILeaderboardColumnProps) {
            super(props);
            this.state = {
                isShowing: true
            };
        }

        public componentDidMount() {
            $.getJSON(this.props.bountiesUrl, function (data, status, jqXHR) {
                //data should be all the bounties, need to group by squad rank and add them to the this.props.leaderboardItems
                //$.each(data, function (i, value) {
                //    var leaderBoardItem = new LeaderboardItem(i, value.squadName, 
                //}.bind(this.props.leaderboardItems));
                this.setState({ isShowing: this.state.isShowing }); // change state to trigger a render
            }.bind(this));
        }

        public render() {
            if (!this.state.isShowing) return;
            var allLeaders = this.props.model.leaderboardItems.map(i => {
                return (<li key={i.id}>
                    <LeaderboardItemComponent model={i} />
                </li>);
            });
            return (<div>
                <a href="bounties">Bounty List</a>

                <div className="leaderboard-column-container">
                    <div className="leaderboard-column-header">
                        <span className="leaderboard-column-header-title">{this.props.model.title}</span>
                        <span className="leaderboard-column-header-endDate">{this.props.model.fromDate != null ? this.props.model.fromDate.toDateString() : ""}</span>
                    </div>
                    <ul>
                        {allLeaders}
                    </ul>
                </div>
            </div>);
        }
    }
}

// Get these from our backend
var leaderboardItem1 = new Leaderboard.LeaderboardItem(1, "Boom Squad", "https://i.embed.ly/1/display?key=fc778e44915911e088ae4040f9f86dcd&url=https%3A%2F%2Fcrdurant26.files.wordpress.com%2F2015%2F02%2Fboom.jpg", 100, 1000, 60);
var array = new Array<Leaderboard.ILeaderboardItem>();
array.push(leaderboardItem1);

var dayOfWeek = new Date().getDay();
var startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

var leaderboardItems = new Leaderboard.LeaderboardColumnModel(array, startOfWeek, "This Week");

var App = Leaderboard.LeaderboardColumnComponent;

var leaderboardElem = document.getElementById('leaderboard-content');
if (leaderboardElem) {
    ReactDOM.render(<App model={leaderboardItems} bountiesUrl='/home/bounties' />, leaderboardElem);
} 

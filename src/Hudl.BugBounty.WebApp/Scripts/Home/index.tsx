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

    export interface ILeaderboardAppProps {
        leaderboardColumns: Array<ILeaderboardColumnModel>;
        baseBountiesUrl: string;
    }

    export interface ILeaderboardAppState {

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
            return (<div className="leaderboard-item-container" key={this.props.model.id}>
                        <h3 className="leaderboard-item-rank">{this.props.model.position}</h3>
                        <img className="leaderboard-item-squad-image" src={this.props.model.squadImageUrl}></img>
                        <h3 className="leaderboard-item-squadname">{this.props.model.squadName}</h3>
                        <div className="leaderboard-item-points-container">
                            <h3 className="points">
                                <span className="pt-value">{this.props.model.timeframePoints}</span>
                            </h3>
                        </div>
                    </div>
            );
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
                for (var i in data) {
                    var leader = data[i];
                    this.props.model.leaderboardItems.push(new LeaderboardItem((+i + 1), leader.SquadName, leader.SquadImage, +leader.TimeWindowScore, +leader.AllTimeScore, 0));
                }
                this.setState({ isShowing: this.state.isShowing }); // change state to trigger a render
            }.bind(this));
        }

        public render() {
            if (!this.state.isShowing) return;
            var allLeaders = this.props.model.leaderboardItems.map(i => {
                return (<LeaderboardItemComponent key={i.id} model={i} />);
                //I know that typescript complains about key, but react needs it!
            });
            return (<li className="flex-item">
                <main>
                    <h1>{this.props.model.title}</h1>
                    <h1>From {this.props.model.fromDate.toDateString() }</h1>
                    <div className="leaderboard-column-container">
                        <div className="headers">
                            <h3 className="rank">Rank</h3>
                            <h3 className="squad">Squad</h3>
                            <h3 className="points">Points</h3>
                        </div>
                        {allLeaders}
                    </div>

                </main>
            </li>);
        }
    }

    export class LeaderboardAppComponent extends React.Component<ILeaderboardAppProps, ILeaderboardAppState>{
        constructor(props: ILeaderboardAppProps) {
            super(props);
        }

        public render() {
            var columns = this.props.leaderboardColumns.map(i => {
                return (<LeaderboardColumnComponent key={i.title} model={i} bountiesUrl={this.props.baseBountiesUrl + "?fromDate=" + i.fromDate.toISOString() } />);
            });
            return (<ul className="flex-container">
                {columns}
            </ul>);
        }
    }
}

// Get these from our backend
//var leaderboardItem1 = new Leaderboard.LeaderboardItem(1, "Boom Squad", "https://i.embed.ly/1/display?key=fc778e44915911e088ae4040f9f86dcd&url=https%3A%2F%2Fcrdurant26.files.wordpress.com%2F2015%2F02%2Fboom.jpg", 100, 1000, 60);
//var array = new Array<Leaderboard.ILeaderboardItem>();
//array.push(leaderboardItem1);

var dayOfWeek = new Date().getDay();
var startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

var leaderboardItemsThisWeek = new Leaderboard.LeaderboardColumnModel(new Array<Leaderboard.ILeaderboardItem>(), startOfWeek, "This Week");


var leaderboardColumnAllTime = new Leaderboard.LeaderboardColumnModel(new Array<Leaderboard.ILeaderboardItem>(), new Date(2016, 1, 1), "All Time");

var columns = new Array<Leaderboard.ILeaderboardColumnModel>();
columns.push(leaderboardItemsThisWeek);
columns.push(leaderboardColumnAllTime);

var homeElem = document.getElementById('home-content');
var App = Leaderboard.LeaderboardAppComponent;
if (homeElem) {
    ReactDOM.render(<App leaderboardColumns={columns} baseBountiesUrl='/home/getleaders' />, homeElem);
}

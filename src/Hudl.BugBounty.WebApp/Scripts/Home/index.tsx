// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="../../typings/tsd.d.ts" />

import React =  require('react');
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
                                <span className="pt-change">Change: {this.props.model.daysChange}</span>
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
            var allLeaders = this.props.model.leaderboardItems.map(i=> {
                return (<LeaderboardItemComponent key={i.id} model={i} />); //I know that typescript complains about key, but react needs it!
            });
            return (<li className="flex-item">
                        <main>
                            <h1>{this.props.model.title}</h1>
                            <h1>From {this.props.model.fromDate.toDateString()}</h1>
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
            var columns = this.props.leaderboardColumns.map(i=> {
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


//var leaderboardItemAllTime1 = new Leaderboard.LeaderboardItem(1, "Alpha Squad", "data:image/png;base64,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", 100, 1000, 60);
//var allTimeArray = new Array<Leaderboard.ILeaderboardItem>();
//allTimeArray.push(leaderboardItemAllTime1);

var leaderboardColumnAllTime = new Leaderboard.LeaderboardColumnModel(new Array<Leaderboard.ILeaderboardItem>(), new Date(2016, 1, 1), "All Time");

var columns = new Array<Leaderboard.ILeaderboardColumnModel>();
columns.push(leaderboardItemsThisWeek);
columns.push(leaderboardColumnAllTime);

var homeElem = document.getElementById('home-content');
var App = Leaderboard.LeaderboardAppComponent;
if(homeElem){
    ReactDOM.render(<App leaderboardColumns={columns} baseBountiesUrl='/home/getleaders' />, homeElem); 
}

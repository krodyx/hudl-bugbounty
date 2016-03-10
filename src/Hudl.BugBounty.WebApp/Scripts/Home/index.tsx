// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />
import React =  require('react');
import ReactDOM = require('react-dom');

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
    }

    export interface ILeaderboardColumnState {
        isShowing: boolean;
    }

    export interface ILeaderboardColumnProps {
        Title: string;
        EndDate: string;
        model: ILeaderboardColumnModel;
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
            return (<div class="leaderboard-item-container">
                        <span class="leaderboard-item-position">{this.props.model.position}</span>
                        <span class="leaderboard-item-squad-image"><a href={this.props.model.squadImageUrl}></a></span>
                        <span class="leaderboard-item-squad">
                            <div class="leaderboard-item-squad-squadname">{this.props.model.squadName}</div>
                            <div class="leaderboard-item-squad-alltimepoints">{this.props.model.alltimePoints}</div>
                        </span>
                        <span class="leaderboard-item-points">
                            <div class="leaderboard-item-points-timeframepoints">{this.props.model.timeframePoints}</div>
                            <div class="leaderboard-item-points-change">{this.props.model.daysChange}</div>
                        </span>
                    </div>);
        }
    }

    export class LeaderboardColumnModel implements ILeaderboardColumnModel {
        private _leaderboardItems: Array<ILeaderboardItem>;
        get leaderboardItems() {
            return this._leaderboardItems;
        }

        constructor(leaderboardItems: Array<ILeaderboardItem>) {
            this._leaderboardItems = leaderboardItems;
        }
    }

    export class LeaderboardColumnComponent extends React.Component<ILeaderboardColumnProps, {}>{
        constructor(props: ILeaderboardColumnProps) {
            super(props);
        }

        public render() {
            var allLeaders = this.props.model.leaderboardItems.map(i=> {
                return (<li key={i.id}>
                            <LeaderboardItemComponent model={i} />
                        </li>);
            });
            return (<div class="leaderboard-column-container">
                        <div class="leaderboard-column-header">
                            <span class="leaderboard-column-header-title">{this.props.Title}</span>
                            <span class="leaderboard-column-header-endDate">{this.props.EndDate}</span>
                            </div>
                        <ul>
                            {allLeaders}
                        </ul>
                    </div>);
        }
    }
}

// Get these from our backend
var leaderboardItem1 = new Leaderboard.LeaderboardItem(1, "Boom Squad", "https://i.embed.ly/1/display?key=fc778e44915911e088ae4040f9f86dcd&url=https%3A%2F%2Fcrdurant26.files.wordpress.com%2F2015%2F02%2Fboom.jpg", 100, 1000, 60);
var array = new Array<Leaderboard.ILeaderboardItem>();
array.push(leaderboardItem1);
var leaderboardItems = new Leaderboard.LeaderboardColumnModel(array);

var App = Leaderboard.LeaderboardColumnComponent;

ReactDOM.render(<App Title='This Week' EndDate={new Date(2016, 3, 10).toDateString()} model={leaderboardItems} />, document.getElementById('content')); 

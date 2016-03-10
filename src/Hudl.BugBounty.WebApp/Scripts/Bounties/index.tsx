// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="../../typings/react/react.d.ts" />
/// <reference path="../../typings/react/react-dom.d.ts" />
import React =  require('react');
import ReactDOM = require('react-dom');

module BountyBoard {
   
   // interfaces
   export interface IBountyBoardItem {
        id: number;
        position: number;
        signature: string;
        serviceName: string;
        description: string;
        value: number;
        assigned: boolean;
   }

   export interface IBountyBoardItemProps {
    model: IBountyBoardItem;
   }

   export interface IBountyBoardModel {
        bountyBoardItems: Array<IBountyBoardItem>;
   }

   export interface IBountyBoardState {
        isVisible: boolean;
   }

   export interface IBountyBoardProps {
        Title: string;
        model: IBountyBoardModel;
   }

   export class BountyBoardItem implements IBountyBoardItem {
        static BountyBoardItemId: number = 0;

        private _id: number;
        private _position: number;
        private _signature: string;
        private _serviceName: string;
        private _description: string;
        private _value: number;
        private _assigned: boolean;

        get id() {
            return BountyBoardItem.BountyBoardItemId++;       
        }

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

        get assigned() {
            return this._assigned;
        }

        get value(){
            return this._value;
        }

        constructor(position: number, signature: string, serviceName: string, description: string, value: number) {
            this._position = position;
            this._signature = signature;
            this._serviceName = serviceName;
            this._description = description;
            this._value = value;
        }
    }

    export class BountyBoardItemComponent extends React.Component<IBountyBoardItemProps, {}>{
        constructor(props: IBountyBoardItemProps) {
            super(props);
        }


        public render() {
            return (<div className="bountyboard-item-container">
                <div className="bountyboard-item-position">Pos: {this.props.model.position}</div>
                <div className="bountyboard-item-signature">Signature: {this.props.model.signature}</div>
                <div className="bountyboard-item-serviceName">Service: {this.props.model.serviceName}</div>
                <div className="bountyboard-item-description">Description: {this.props.model.description}</div>
                <div className="bountyboard-item-value">Value: {this.props.model.value}</div>
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

      export class BountyBoardComponent extends React.Component<IBountyBoardProps, {}>{
        constructor(props: IBountyBoardProps) {
            super(props);
        }

        public render() {
            var allBounties = this.props.model.bountyBoardItems.map(i=> {
                return (<li key={i.id}>
                            <BountyBoardItemComponent model={i} />
                        </li>);
            });
            return (<div className="bountyboard-container">
                        <div className="bountyboard-header">
                            <span className="bountyboard-header-title">{this.props.Title}</span>
                            </div>
                        <ul>
                            {allBounties}
                        </ul>
                    </div>);
        }
    }
}

var array = new Array<BountyBoard.IBountyBoardItem>();
var bountyBoardItem = new BountyBoard.BountyBoardItem(1, "A12345", "Alpha", "Something went wrong", 850);
array.push(bountyBoardItem);

var bountyboardItems = new BountyBoard.BountyBoardModel(array);

var App = BountyBoard.BountyBoardComponent;

ReactDOM.render(<App Title='Top Bounties' model={bountyboardItems} />, document.getElementById('content')); 

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
        assigned: boolean;
   }

   export interface IBountyBoardItemProps {
    model: IBountyBoardItem;
   }

   export interface IBountyBoardColumnModel {
        bountyBoardItems: Array<IBountyBoardItem>;
   }

   export interface IBountyBoardColumnState {
        isVisible: boolean;
   }

   export interface IBountyBoardColumnProps {
        Title: string;
        model: IBountyBoardColumnModel;
   }

   export class BountyBoardItem implements IBountyBoardItem {
        static BountyBoardItemId: number = 0;

        private _id: number;
        private _position: number;
        private _signature: string;
        private _serviceName: string;
        private _description: string;
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

        constructor(position: number, signature: string, serviceName: string, description: string) {
            this._position = position;
            this._signature = signature;
            this._serviceName = serviceName;
            this._description = description;
        }
    }

    export class BountyBoardItemComponent extends React.Component<IBountyBoardItemProps, {}>{
        constructor(props: IBountyBoardItemProps) {
            super(props);
        }


        public render() {
            return (<div className="bountyboard-item-container">
                <div className="bountyboard-item-position">Pos: {this.props.model.position}</div>
                <div className="bountyboard-item-squad-signature">Signature: {this.props.model.signature}</div>
                <div className="bountyboard-item-squad-serviceName">Service: {this.props.model.serviceName}</div>
                <div className="bountyboard-item-points-description">Description: {this.props.model.description}</div>
                </div>
                );
        }
    }

    export class BountyBoardColumnModel implements IBountyBoardColumnModel {
        private _bountyBoardItems: Array<IBountyBoardItem>;
        get bountyBoardItems() {
            return this._bountyBoardItems;
        }

        constructor(bountyBoardItems: Array<IBountyBoardItem>) {
            this._bountyBoardItems = bountyBoardItems;
        }
    }

      export class BountyBoardColumnComponent extends React.Component<IBountyBoardColumnProps, {}>{
        constructor(props: IBountyBoardColumnProps) {
            super(props);
        }

        public render() {
            var allBounties = this.props.model.bountyBoardItems.map(i=> {
                return (<li key={i.id}>
                            <BountyBoardItemComponent model={i} />
                        </li>);
            });
            return (<div className="bountyboard-column-container">
                        <div className="bountyboard-column-header">
                            <span className="bountyboard-column-header-title">{this.props.Title}</span>
                            </div>
                        <ul>
                            {allBounties}
                        </ul>
                    </div>);
        }
    }
}

var bountyBoardItem1 = new BountyBoard.BountyBoardItem(1, "A12345", "Alpha", "Something went wrong");
var array = new Array<BountyBoard.IBountyBoardItem>();
array.push(bountyBoardItem1);
var bountyboardItems = new BountyBoard.BountyBoardColumnModel(array);

var App = BountyBoard.BountyBoardColumnComponent;

ReactDOM.render(<App Title='Top Bounties' model={bountyboardItems} />, document.getElementById('content')); 

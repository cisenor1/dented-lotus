import * as React from "react"; 
import {PropsBase} from "../Utilities/ComponentUtilities"

export interface UserProps extends PropsBase { 
    small?:boolean;

}

export interface SmallNameProps  {
    name:string;
    imgUrl:string;
}

export class UserComponent extends React.Component<UserProps, any>{ 
    /**
     *
     */
    constructor(props: UserProps) {
        super(props);
    }

    componentDidMount(): void {

    }

    changed(inValue) {
        this.setState((prevState)=>({
            firstName : inValue.target.value
        })); 
    }


    render(): JSX.Element | null { 
        if (this.props.small){
            return <SmallUser imgUrl={this.props.stateManager.currentUser.imageUrl} name={this.props.stateManager.currentUser.getName()}/>
        }
        return <FullUser stateManager={this.props.stateManager}/>
    }
}

function FullUser(props:UserProps){
        return <div>
            <div> 
            </div>  
        </div>;
}
function SmallUser(props:SmallNameProps){
    return <div className="small-user">
            <img className="round" src={props.imgUrl}/>
            <span>{props.name}</span>
        </div>
}
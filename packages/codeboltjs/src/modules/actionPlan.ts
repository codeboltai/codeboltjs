
import cbws from '../core/websocket';
import {  EventType, ActionPlanAction, ActionPlanResponseType } from '@codebolt/types/enum';


const codeboltActionPlan = {

    getAllPlans:()=>{
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,  
                "action": ActionPlanAction.GETALL_ACTION_PLAN,
               
            },
            ActionPlanResponseType.GETALL_ACTION_PLAN_RESPONSE
        );
    },
    getPlanDetail:(planeId:string)=>{
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,  
                "action": ActionPlanAction.GET_PLAN_DETAIL,
                planeId
               
            },
            ActionPlanResponseType.GET_PLAN_DETAIL_RESPONSE
        );

    }

}

export default codeboltActionPlan
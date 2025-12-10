
import cbws from '../core/websocket';
import { EventType, ActionPlanAction, ActionPlanResponseType } from '@codebolt/types/enum';


const codeboltActionPlan = {

    /**
     * Get all action plans
     * @returns Promise with all action plans
     */
    getAllPlans: () => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,
                "action": ActionPlanAction.GETALL_ACTION_PLAN,
            },
            ActionPlanResponseType.GETALL_ACTION_PLAN_RESPONSE
        );
    },

    /**
     * Get action plan detail by ID
     * @param planId - The ID of the action plan
     * @returns Promise with action plan details
     */
    getPlanDetail: (planId: string) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,
                "action": ActionPlanAction.GET_PLAN_DETAIL,
                message: { planId }
            },
            ActionPlanResponseType.GET_PLAN_DETAIL_RESPONSE
        );
    },

    /**
     * Get action plan detail by ID (alternative method)
     * @param planId - The ID of the action plan
     * @returns Promise with action plan details
     */
    getActionPlanDetail: (planId: string) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,
                "action": ActionPlanAction.GET_ACTION_PLAN_DETAIL,
                message: { planId }
            },
            ActionPlanResponseType.GET_ACTION_PLAN_DETAIL_RESPONSE
        );
    },

    /**
     * Create a new action plan
     * @param payload - Action plan creation data (name, description, agentId, agentName, status, planId)
     * @returns Promise with created action plan
     */
    createActionPlan: (payload: {
        name: string;
        description?: string;
        agentId?: string;
        agentName?: string;
        status?: string;
        planId?: string;
    }) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,
                "action": ActionPlanAction.CREATE_ACTION_PLAN,
                message: payload
            },
            ActionPlanResponseType.CREATE_ACTION_PLAN_RESPONSE
        );
    },

    /**
     * Update an existing action plan
     * @param planId - The ID of the action plan to update
     * @param updateData - Data to update in the action plan
     * @returns Promise with updated action plan
     */
    updateActionPlan: (planId: string, updateData: any) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,
                "action": ActionPlanAction.UPDATE_ACTION_PLAN,
                message: { planId, ...updateData }
            },
            ActionPlanResponseType.UPDATE_ACTION_PLAN_RESPONSE
        );
    },

    /**
     * Add a task to an action plan
     * @param planId - The ID of the action plan
     * @param task - Task data to add (name, description, priority, taskType, etc.)
     * @returns Promise with added task and updated action plan
     */
    addTaskToActionPlan: (planId: string, task: {
        name: string;
        description?: string;
        priority?: string;
        taskType?: string;
        [key: string]: any;
    }) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,
                "action": ActionPlanAction.ADD_TASK_TO_ACTION_PLAN,
                message: { planId, task }
            },
            ActionPlanResponseType.ADD_TASK_TO_ACTION_PLAN_RESPONSE
        );
    },

    /**
     * Add a group to an action plan
     * @param planId - The ID of the action plan
     * @param group - Group data to add (type, name, groupItems/loopTasks/ifTasks/waitTasks, etc.)
     * @returns Promise with added group and updated action plan
     */
    addGroupToActionPlan: (planId: string, group: {
        type: 'parallelGroup' | 'loopGroup' | 'ifGroup' | 'waitUntilGroup';
        name?: string;
        groupItems?: Record<string, any[]>; // For parallelGroup
        loopTasks?: any[]; // For loopGroup
        ifTasks?: any[]; // For ifGroup
        waitTasks?: any[]; // For waitUntilGroup
        [key: string]: any;
    }) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,
                "action": 'addGroupToActionPlan' as ActionPlanAction,
                message: { planId, task: group }
            },
            ActionPlanResponseType.ADD_TASK_TO_ACTION_PLAN_RESPONSE
        );
    },

    /**
     * Start/execute a task step in an action plan
     * @param planId - The ID of the action plan
     * @param taskId - The ID of the task to start
     * @returns Promise with task execution status
     */
    startTaskStep: (planId: string, taskId: string) => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                "type": EventType.ACTION_PLAN,
                "action": ActionPlanAction.START_TASK_STEP,
                message: { planId, taskId }
            },
            ActionPlanResponseType.START_TASK_STEP_RESPONSE
        );
    },

    /**
     * Start/execute a task step in an action plan with event listener
     * @param planId - The ID of the action plan
     * @param taskId - The ID of the task to start
     * @param onResponse - Callback function that will be called when receiving responses for this task
     * @returns Cleanup function to remove the event listener
     */
    startTaskStepWithListener: (
        planId: string,
        taskId: string,
        onResponse: (response: any) => void
    ) => {
        // Set up event listener
        const listener = (response: any) => {
            // Filter responses related to this specific task
            if (response.type === ActionPlanResponseType.START_TASK_STEP_RESPONSE) {
                if (response?.taskId === taskId) {
                    onResponse(response);
                }
            }
        };

        // Add the listener to the message manager
        cbws.messageManager.on('message', listener);

        // Send the request
        cbws.messageManager.send({
            "type": EventType.ACTION_PLAN,
            "action": ActionPlanAction.START_TASK_STEP,
            message: { planId, taskId }
        });

        // Return cleanup function to remove the listener
        return () => {
            cbws.messageManager.off('message', listener);
        };
    }

}

export default codeboltActionPlan
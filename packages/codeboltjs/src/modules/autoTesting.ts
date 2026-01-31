import cbws from '../core/websocket';
import {
  AutoTestingAction,
  AutoTestingResponseType,
  IAddCaseToSuiteParams,
  IAddCaseToSuiteResponse,
  ICreateCaseParams,
  ICreateCaseResponse,
  ICreateRunParams,
  ICreateRunResponse,
  ICreateSuiteParams,
  ICreateSuiteResponse,
  IDeleteCaseParams,
  IDeleteCaseResponse,
  IDeleteSuiteParams,
  IDeleteSuiteResponse,
  IGetCaseParams,
  IGetCaseResponse,
  IGetRunParams,
  IGetRunResponse,
  IGetSuiteParams,
  IGetSuiteResponse,
  IListCasesParams,
  IListCasesResponse,
  IListRunsParams,
  IListRunsResponse,
  IListSuitesParams,
  IListSuitesResponse,
  IRemoveCaseFromSuiteParams,
  IRemoveCaseFromSuiteResponse,
  IUpdateCaseParams,
  IUpdateCaseResponse,
  IUpdateRunCaseParams,
  IUpdateRunCaseResponse,
  IUpdateRunStatusParams,
  IUpdateRunStatusResponse,
  IUpdateRunStepParams,
  IUpdateRunStepResponse,
  IUpdateSuiteParams,
  IUpdateSuiteResponse,
} from '@codebolt/types/lib';

const cbautoTesting = {
  // ---- Test Suites ----
  createSuite: async (params: ICreateSuiteParams): Promise<ICreateSuiteResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.SUITE_CREATE, ...params },
      AutoTestingResponseType.SUITE_CREATE_RESPONSE,
    ),

  getSuite: async (params: IGetSuiteParams): Promise<IGetSuiteResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.SUITE_GET, ...params },
      AutoTestingResponseType.SUITE_GET_RESPONSE,
    ),

  listSuites: async (_params?: IListSuitesParams): Promise<IListSuitesResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.SUITE_LIST },
      AutoTestingResponseType.SUITE_LIST_RESPONSE,
    ),

  updateSuite: async (params: IUpdateSuiteParams): Promise<IUpdateSuiteResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.SUITE_UPDATE, ...params },
      AutoTestingResponseType.SUITE_UPDATE_RESPONSE,
    ),

  deleteSuite: async (params: IDeleteSuiteParams): Promise<IDeleteSuiteResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.SUITE_DELETE, ...params },
      AutoTestingResponseType.SUITE_DELETE_RESPONSE,
    ),

  addCaseToSuite: async (params: IAddCaseToSuiteParams): Promise<IAddCaseToSuiteResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.SUITE_CASE_ADD, ...params },
      AutoTestingResponseType.SUITE_CASE_ADD_RESPONSE,
    ),

  removeCaseFromSuite: async (params: IRemoveCaseFromSuiteParams): Promise<IRemoveCaseFromSuiteResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.SUITE_CASE_REMOVE, ...params },
      AutoTestingResponseType.SUITE_CASE_REMOVE_RESPONSE,
    ),

  // ---- Test Cases ----
  createCase: async (params: ICreateCaseParams): Promise<ICreateCaseResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.CASE_CREATE, ...params },
      AutoTestingResponseType.CASE_CREATE_RESPONSE,
    ),

  getCase: async (params: IGetCaseParams): Promise<IGetCaseResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.CASE_GET, ...params },
      AutoTestingResponseType.CASE_GET_RESPONSE,
    ),

  listCases: async (_params?: IListCasesParams): Promise<IListCasesResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.CASE_LIST },
      AutoTestingResponseType.CASE_LIST_RESPONSE,
    ),

  updateCase: async (params: IUpdateCaseParams): Promise<IUpdateCaseResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.CASE_UPDATE, ...params },
      AutoTestingResponseType.CASE_UPDATE_RESPONSE,
    ),

  deleteCase: async (params: IDeleteCaseParams): Promise<IDeleteCaseResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.CASE_DELETE, ...params },
      AutoTestingResponseType.CASE_DELETE_RESPONSE,
    ),

  // ---- Test Runs ----
  createRun: async (params: ICreateRunParams): Promise<ICreateRunResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.RUN_CREATE, ...params },
      AutoTestingResponseType.RUN_CREATE_RESPONSE,
    ),

  getRun: async (params: IGetRunParams): Promise<IGetRunResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.RUN_GET, ...params },
      AutoTestingResponseType.RUN_GET_RESPONSE,
    ),

  listRuns: async (params?: IListRunsParams): Promise<IListRunsResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.RUN_LIST, ...(params || {}) },
      AutoTestingResponseType.RUN_LIST_RESPONSE,
    ),

  updateRunStatus: async (params: IUpdateRunStatusParams): Promise<IUpdateRunStatusResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.RUN_UPDATE_STATUS, ...params },
      AutoTestingResponseType.RUN_UPDATE_STATUS_RESPONSE,
    ),

  updateRunCaseStatus: async (params: IUpdateRunCaseParams): Promise<IUpdateRunCaseResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.RUN_CASE_UPDATE, ...params },
      AutoTestingResponseType.RUN_CASE_UPDATE_RESPONSE,
    ),

  updateRunStepStatus: async (params: IUpdateRunStepParams): Promise<IUpdateRunStepResponse> =>
    cbws.messageManager.sendAndWaitForResponse(
      { type: AutoTestingAction.RUN_STEP_UPDATE, ...params },
      AutoTestingResponseType.RUN_STEP_UPDATE_RESPONSE,
    ),
};

export default cbautoTesting;

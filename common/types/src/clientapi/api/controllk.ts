// ControlLK API types

export interface ControllkCommand {
  command: string;
  args?: Record<string, unknown>;
}

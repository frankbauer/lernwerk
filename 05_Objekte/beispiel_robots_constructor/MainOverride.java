

class MainOverride {
    public static void main(String[] args) {
        RoboticConstruct.main(args);
        RobotFactory.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}
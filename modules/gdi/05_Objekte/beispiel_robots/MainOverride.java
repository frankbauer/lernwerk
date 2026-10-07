

class MainOverride {
    public static void main(String[] args) {
        Robotic.main(args);
        RobotFactory.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}


class MainOverride {
    public static void main(String[] args) {
        MovePlayer.main(args);
        FloatingWorld.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}
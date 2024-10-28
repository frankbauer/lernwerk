

class MainOverride {
    public static void main(String[] args) {
        Nature.main(args);
        SunnyHill.COMMAND_BUFFER.sendCommands("Error: sendCommands called twice");    
    }
}
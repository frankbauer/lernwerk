class RobotFactory {
    public static final CommandBuffer COMMAND_BUFFER = new CommandBuffer();

    public static Robot addRobotToMainRoom(int x, int y){
        Robot robot = new Robot();
        robot.setLocation(x, y);
        robot.setRoom(Room.getMainRoom());
        return robot;
    }

    public static void startMovingRobots(){
        Room.getMainRoom().startMovingRobots(true);
    }

    public static void stopMovingRobots(){
        Room.getMainRoom().startMovingRobots(false);
    }
}

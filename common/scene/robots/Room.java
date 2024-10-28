class Room extends RemoteObject{   
    private final java.util.List<Robot> robots = new java.util.LinkedList<>();
    public static Room MAIN_ROOM = null;
    private boolean visible;
    private final String roomStyle;

    public Room() {
        this(true);
    }

    Room(boolean visible){
        super("Room");

        this.visible = visible;
        this.roomStyle = "main";
        RobotFactory.COMMAND_BUFFER.addNewObject(this);

        if (visible) show(visible);        
    }

    public void show(boolean display){
        this.visible = display;
        RobotFactory.COMMAND_BUFFER.addCommand("show", this, new JsonObject().put("visible", display));
    }

    protected void registerRobot(Robot r){
        this.robots.add(r);
    }

    protected void unregisterRobot(Robot r){
        this.robots.remove(r);
    }

    protected void addAttributes(JsonObject json){
        json.put("visible", this.visible);        
        json.put("style", this.roomStyle);
    }

    public static void displayMainRoom(boolean display){        
        Room.getMainRoom().show(display);        
    }

    public static int getRoomWidth(){
        return 800;
    }

    public static int getRoomHeight(){
        return 450;
    }

    static Room getMainRoom(){
        if (MAIN_ROOM == null){
            MAIN_ROOM = new Room(false);
        }
        return MAIN_ROOM;
    }

    void startMovingRobots(boolean moving){
        for (Robot r : this.robots){
            r.setMoving(moving);
        }
    }
}

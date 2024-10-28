class Robot extends RemoteObject{
    private static int NEXT_ROBOT_TYPE = 0;    
    private final int robotType;
    private Room room;

    public Robot(int x, int y, Room room){
        this();
        this.setLocation(x, y);
        this.setRoom(room);
    }
    
    public Robot(){
        this(NEXT_ROBOT_TYPE++);
    }

    public Robot(int type){
        super("Robot");

        this.robotType = type%12 + 1;
        RobotFactory.COMMAND_BUFFER.addNewObject(this);
    }

    protected void addAttributes(JsonObject json){
        json.put("robotType", this.robotType);
        if (this.room != null)
            json.put("room", this.room.toJsonReference());
    }

    public void setLocation(int x, int y){
        RobotFactory.COMMAND_BUFFER.addCommand("setLocation", this, new JsonObject().put("x", x).put("y", y));
    }

    public void setRoom(Room room){
        if (room == null) throw new IllegalArgumentException("Room cannot be null");
        if (this.room != null) this.room.unregisterRobot(this);
        room.registerRobot(this);
        this.room = room;
        RobotFactory.COMMAND_BUFFER.addCommand("setRoom", this,  new JsonObject().put("room", room.toJsonReference()));
    }

    public void setMoving(boolean moving){
        RobotFactory.COMMAND_BUFFER.addCommand("setMoving", this, new JsonObject().put("moving", moving));
    }
}

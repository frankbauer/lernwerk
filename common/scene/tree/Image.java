class Image extends RemoteObject{
    private final String name;
    private final double scale;
    private final double anchorX;
    private final double anchorY;
    public Image(String name){
        this(name, 1.0, 0, 0);
    }

    public Image(String name, double scale){
        this(name, scale, 0, 0);     
    }

    public Image(String name, double scale, double anchorX, double anchorY){
        super("Image");
        this.name = name;
        this.scale = scale;
        this.anchorX = anchorX;
        this.anchorY = anchorY;
        Graphics2D.COMMAND_BUFFER.addNewObject(this);
    }

    protected void addAttributes(JsonObject json){
        json.put("name", name);
        json.put("sx", scale);
        json.put("sy", scale);
        json.put("ax", anchorX);
        json.put("ay", anchorY);
    }
}

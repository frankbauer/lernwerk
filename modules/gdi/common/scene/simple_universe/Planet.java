class Planet {
    private final Sonne sonne;
    private double radius;
    private double speed;
    // id of this planet in the hologram playground (HoloScene)
    final int holoId;

    public Planet(){
        this(null);
    }
    public Planet(Sonne s) {
        this.sonne = s;
        this.holoId = HoloScene.create("Planet", s != null ? s.holoId : -1);
        if (s != null) {
            s.registerPlanet(this);
        }
    }
    
    public void setRadius(double d){
        this.radius = d;
        HoloScene.set(holoId, "radius", d);
    }

    public void setSpeed(double d){
        this.speed = d;
        HoloScene.set(holoId, "speed", d);
    }

    public String toString(){
        return "s: " + this.speed + ", r: " + this.radius;
    }

    public void print(){
        print(null);
    }

    public void print(String indent){
        if (indent == null) {
            indent = "";
        }
        HoloScene.print(holoId);
        System.out.println(indent + "Planet [" + this + "]");
    }
}

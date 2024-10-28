class Planet {
    private final Sonne sonne;
    private double radius;
    private double speed;

    public Planet(){
        this(null);
    }
    public Planet(Sonne s) {
        this.sonne = s;
        if (s != null) {
            s.registerPlanet(this);
        }
    }
    
    public void setRadius(double d){
        this.radius = d;
    }

    public void setSpeed(double d){
        this.speed = d;
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
        System.out.println(indent + "Planet [" + this + "]");
    }
}

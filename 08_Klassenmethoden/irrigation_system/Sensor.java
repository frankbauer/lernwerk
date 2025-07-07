class Sensor {
    public static final int SPRING = 0;
    public static final int SUMMER = 1;
    public static final int AUTUMN = 2;
    public static final int WINTER = 3;

    public static int getSeason(){
        return (int)((WINTER-SPRING+1)*Math.random());
    }
}

class Car {
    public static int getDirection(){
        return 0;
    }
    public static float getConsumption(){
        return 0.0f;
    }
    public static float getFillLevel(){
        return 0.0f;
    }
    public static String getFillingStation(float direction, float range){
        return "Test";
    }
    public static void startNavigation(String destination){
        System.out.println("Navigation nach" + destination + " wird gestartet.")
    }
}

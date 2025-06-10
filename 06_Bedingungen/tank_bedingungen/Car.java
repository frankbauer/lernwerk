class Car {
    public static final int NORD = 0;
    public static final int NORDOST = 1;
    public static final int OST = 2;
    public static final int SUEDOST = 3;
    public static final int SUED = 4;
    public static final int SUEDWEST = 5;
    public static final int WEST = 6;
    public static final int NORDWEST = 7;

    public static int getDirection(){
        return (int) (Math.random()*8);
    }

    public static void printDirection(int direction){
        if (direction == NORD){
            System.out.println("Fahrtrichtung: Norden");
        } else if (direction == NORDOST){
            System.out.println("Fahrtrichtung: Nordosten");
        } else if (direction == OST){
            System.out.println("Fahrtrichtung: Osten");
        } else if (direction == SUEDOST){
            System.out.println("Fahrtrichtung: Suedosten");
        } else if (direction == SUED){
            System.out.println("Fahrtrichtung: Sueden");
        } else if (direction == SUEDWEST){
            System.out.println("Fahrtrichtung: Suedwesten");
        } else if (direction == WEST){
            System.out.println("Fahrtrichtung: Westen");
        }else if (direction == NORDWEST){
            System.out.println("Fahrtrichtung: Nordwesten");
        }else{
            System.out.println("keine gueltige Fahrtrichtung fuer uebergebenen Wert gefunden");
        }
    }

    public static float getConsumption(){
        return 3.5f+(float)(Math.random()*10);
    }

    public static float getFillLevel(){
        return (float) (Math.random()*7);
    }

    public static String getFillingStation(int direction, float range){
        String fillingStation = null;
        if (direction == NORD){
            if (range>=50){
                fillingStation = "Esso-Tankstelle Albaching Nord";
            }/*else{
                fillingStation = "JET-Tankstelle Weissensee Nordost";
            }*/
        } else if (direction == NORDOST){
            if (range>=50){
                fillingStation = "JET-Tankstelle Weissensee Nordost";
            }/*else{
                fillingStation = "Esso-Tankstelle Albaching Nord";
            }*/
        } else if (direction == OST){
            if (range>=55){
                fillingStation = "ARAL-Tankstelle Knilch Ost";
            }/*else{
                fillingStation = "OMV-Tankstelle Steinach Suedost";
            }*/
        } else if (direction == SUEDOST){
            if (range>=55){
                fillingStation = "OMV-Tankstelle Steinach Suedost";
            }/*else{
                fillingStation = "Shell-Tankstelle Welzer Sued";
            }*/
        } else if (direction == SUED){
            if (range>=45){
            fillingStation = "Shell-Tankstelle Welzer Sued";
            } /*else{
                fillingStation = "TOTAL-Tankstelle Waldbad Suedwest";
            }*/
        } else if (direction == SUEDWEST){
            if (range>=45){
            fillingStation = "TOTAL-Tankstelle Waldbad Suedwest";
            }/* else{
                fillingStation = "Shell-Tankstelle Welzer Sued";
            }*/
        } else if (direction == WEST){
            if (range>=40){
            fillingStation = "Agip-Tankstelle Reuther West";
            }/*else{
                fillingStation = "BayWa-Tankstelle Heller Nordwest";
            }*/
        } else if (direction == NORDWEST){
            if (range>=40){
                fillingStation = "BayWa-Tankstelle Heller Nordwest";
            }/* else{
                fillingStation = "Esso-Tankstelle Albaching Nord";
            }*/
        }
        return fillingStation;
    }

    public static String getNearestFillingStation(){
        return "Esso-Tankstelle Albaching Nord";
    }

    public static float getDistance(String destination){
        return 60;
    }

    public static void startNavigation(String destination){
        if (destination == null){
            System.out.println("Ziel nicht gefunden");
        }
        System.out.println("Navigation nach " + destination + " wird gestartet.");
    }
}

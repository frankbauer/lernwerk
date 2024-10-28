class MeineSumme {
    public static Integer sum(Node<Integer> cur){
        if (cur == null) { return 0; }
    
        Integer zwErg = cur.getPayload();
        for (Node<Integer> child : cur.childNodes()) {
            zwErg += sum(child);
        }
        return zwErg;            
    }
}
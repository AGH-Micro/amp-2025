function [I,Q] = transfor(X,Y,Ox,Oy,phi)

I=[];
Q=[];

    x_nodc=X - Ox;
    y_nodc=Y - Oy;
   
    Xf=x_nodc*cos(phi)-y_nodc*sin(phi);
    Yf=x_nodc*sin(phi)+y_nodc*cos(phi);
    Ai=(abs(max(Xf))+abs(min(Xf)))/2;
    Aq=(abs(max(Yf))+abs(min(Yf)))/2;
    
    I=Xf/Ai;
    Q=Yf/Aq;


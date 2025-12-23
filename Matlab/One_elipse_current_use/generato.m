
function [I, Q] = generato(t)
    pom = 100;
    A=8*(1+rand(1)/pom); %
    B=6*(1+rand(1)/pom); %6
    b=(3+rand(1)/pom);
    a=(4+rand(1)/pom);
    phi=(pi/6+rand(1)/(10*pom));
    
    I=a+A*cos(t);
    Q=b+B*sin(t+phi);
end




    